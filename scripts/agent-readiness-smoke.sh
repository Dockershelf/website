#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3101}"
FEATURE_BLOG="${FEATURE_BLOG:-0}"

fail() {
  echo "FAIL: $1" >&2
  exit 1
}

pass() {
  echo "PASS: $1"
}

header_value() {
  local url="$1"
  local name="$2"
  local accept="${3:-}"
  if [[ -n "${accept}" ]]; then
    curl -sI -H "Accept: ${accept}" "${url}" | tr -d '\r' | awk -F': ' -v n="$(echo "${name}" | tr '[:upper:]' '[:lower:]')" 'tolower($1)==n {print tolower($2); exit}'
  else
    curl -sI "${url}" | tr -d '\r' | awk -F': ' -v n="$(echo "${name}" | tr '[:upper:]' '[:lower:]')" 'tolower($1)==n {print tolower($2); exit}'
  fi
}

echo "Agent readiness smoke against ${BASE_URL} (FEATURE_BLOG=${FEATURE_BLOG})"

# Homepage markdown negotiation
markdown_type=$(header_value "${BASE_URL}/" "content-type" "text/markdown")
[[ "${markdown_type}" == *"text/markdown"* ]] || fail "homepage Accept markdown Content-Type (${markdown_type:-missing})"
pass "homepage markdown negotiation"

html_type=$(header_value "${BASE_URL}/" "content-type")
[[ "${html_type}" == *"text/html"* ]] || fail "homepage default HTML Content-Type (${html_type:-missing})"
pass "homepage HTML default"

vary_accept=$(header_value "${BASE_URL}/" "vary")
[[ "${vary_accept}" == *"accept"* ]] || fail "homepage Vary Accept (${vary_accept:-missing})"
pass "homepage Vary Accept"

q_markdown_type=$(header_value "${BASE_URL}/" "content-type" "text/html;q=0.9, text/markdown;q=1")
[[ "${q_markdown_type}" == *"text/markdown"* ]] || fail "Accept q-value markdown preference (${q_markdown_type:-missing})"
pass "Accept q-value markdown preference"

tie_markdown_type=$(header_value "${BASE_URL}/" "content-type" "text/markdown, text/html")
[[ "${tie_markdown_type}" == *"text/markdown"* ]] || fail "Accept equal-q tie prefers first listed type (${tie_markdown_type:-missing})"
pass "Accept equal-q tie-break"

q_zero_type=$(header_value "${BASE_URL}/" "content-type" "text/markdown;q=0")
[[ "${q_zero_type}" == *"text/html"* ]] || fail "Accept q=0 rejects markdown (${q_zero_type:-missing})"
pass "Accept q=0 rejects markdown"

# OSS placeholder twins (Overview / Install / Community)
for path in overview install community; do
  oss_type=$(header_value "${BASE_URL}/${path}" "content-type" "text/markdown")
  [[ "${oss_type}" == *"text/markdown"* ]] || fail "${path} markdown negotiation (${oss_type:-missing})"
  pass "${path} markdown negotiation"
done

# Unsupported path must not fake markdown
unknown_type=$(header_value "${BASE_URL}/this-page-does-not-exist" "content-type" "text/markdown")
[[ "${unknown_type}" != *"text/markdown"* ]] || fail "unsupported path returned markdown (${unknown_type})"
pass "unsupported path no false markdown"

# Portfolio / case-study remnants must not advertise markdown twins
portfolio_status=$(curl -sI -H "Accept: text/markdown" "${BASE_URL}/portfolio" | tr -d '\r' | awk 'tolower($1) ~ /^http/ {print $2; exit}')
[[ "${portfolio_status}" == "404" ]] || fail "portfolio should 404 (${portfolio_status:-missing})"
pass "portfolio remnant 404"

# AE8: discovery + twin cache headers (public + SWR + CDN tags)
llms_cache=$(header_value "${BASE_URL}/llms.txt" "cache-control")
[[ "${llms_cache}" == *"public"* ]] || fail "llms.txt Cache-Control public (${llms_cache:-missing})"
[[ "${llms_cache}" == *"stale-while-revalidate"* ]] || fail "llms.txt Cache-Control SWR (${llms_cache:-missing})"
pass "llms.txt cache headers"

twin_cache=$(header_value "${BASE_URL}/overview" "cache-control" "text/markdown")
[[ "${twin_cache}" == *"public"* || "${twin_cache}" == *"s-maxage"* ]] || fail "overview twin Cache-Control (${twin_cache:-missing})"
pass "overview twin cache headers"

# API catalog (blog surfaces only when FEATURE_BLOG=1)
catalog_json=$(curl -s "${BASE_URL}/.well-known/api-catalog")
echo "${catalog_json}" | grep -q "/api/mcp" || fail "api-catalog missing MCP transport"
if [[ "${FEATURE_BLOG}" == "1" ]]; then
  echo "${catalog_json}" | grep -q "search-posts" || fail "api-catalog missing search-posts (blog on)"
  echo "${catalog_json}" | grep -q "feed.xml" || fail "api-catalog missing RSS (blog on)"
  echo "${catalog_json}" | grep -q "atom.xml" || fail "api-catalog missing Atom (blog on)"
  echo "${catalog_json}" | grep -q "feed.json" || fail "api-catalog missing JSON feed (blog on)"
else
  echo "${catalog_json}" | grep -q "search-posts" && fail "api-catalog still lists search-posts (blog off)"
  echo "${catalog_json}" | grep -q "feed.xml" && fail "api-catalog still lists feed.xml (blog off)"
fi
pass "api-catalog completeness"

# Agent skills index
skills_json=$(curl -s "${BASE_URL}/.well-known/agent-skills/index.json")
echo "${skills_json}" | grep -q '"site-discovery"' || fail "agent-skills missing site-discovery"
echo "${skills_json}" | grep -q '"citation"' || fail "agent-skills missing citation"
echo "${skills_json}" | grep -q '"sha256"' || fail "agent-skills missing sha256"
if [[ "${FEATURE_BLOG}" == "1" ]]; then
  echo "${skills_json}" | grep -q '"blog-search"' || fail "agent-skills missing blog-search (blog on)"
else
  echo "${skills_json}" | grep -q '"blog-search"' && fail "agent-skills still lists blog-search (blog off)"
fi
pass "agent-skills index"

# MCP server card
card_json=$(curl -s "${BASE_URL}/.well-known/mcp/server-card.json")
echo "${card_json}" | grep -q '"serverInfo"' || fail "mcp card missing serverInfo"
echo "${card_json}" | grep -q '"endpoint"' || fail "mcp card missing endpoint"
echo "${card_json}" | grep -q 'get_site_discovery' || fail "mcp card missing get_site_discovery"
if [[ "${FEATURE_BLOG}" == "1" ]]; then
  echo "${card_json}" | grep -q 'search_blog_posts' || fail "mcp card missing search_blog_posts (blog on)"
else
  echo "${card_json}" | grep -q 'search_blog_posts' && fail "mcp card still lists search_blog_posts (blog off)"
fi
pass "mcp server card"

# MCP initialize + tools/list
mcp_headers=(-H "Content-Type: application/json" -H "Accept: application/json, text/event-stream")
init_response=$(curl -s -X POST "${BASE_URL}/api/mcp" "${mcp_headers[@]}" -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"smoke","version":"1.0.0"}}}')
echo "${init_response}" | grep -q '"result"' || fail "mcp initialize (${init_response})"
pass "mcp initialize"

tools_response=$(curl -s -X POST "${BASE_URL}/api/mcp" "${mcp_headers[@]}" -d '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}')
echo "${tools_response}" | grep -q 'get_site_discovery' || fail "mcp tools/list missing get_site_discovery (${tools_response})"
if [[ "${FEATURE_BLOG}" == "1" ]]; then
  echo "${tools_response}" | grep -q 'search_blog_posts' || fail "mcp tools/list missing search_blog_posts (${tools_response})"
else
  echo "${tools_response}" | grep -q 'search_blog_posts' && fail "mcp tools/list still has search_blog_posts (blog off) (${tools_response})"
fi
pass "mcp tools/list"

discovery_call=$(curl -s -X POST "${BASE_URL}/api/mcp" "${mcp_headers[@]}" -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"get_site_discovery","arguments":{}}}')
echo "${discovery_call}" | grep -q '"result"' || fail "mcp get_site_discovery (${discovery_call})"
echo "${discovery_call}" | grep -q 'llms.txt' || fail "mcp get_site_discovery missing llms.txt (${discovery_call})"
if [[ "${FEATURE_BLOG}" == "1" ]]; then
  echo "${discovery_call}" | grep -q 'blog_search\|feeds' || fail "mcp get_site_discovery missing blog surfaces (blog on) (${discovery_call})"
else
  echo "${discovery_call}" | grep -q 'blog_search' && fail "mcp get_site_discovery still has blog_search (blog off)"
fi
pass "mcp get_site_discovery"

if [[ "${FEATURE_BLOG}" == "1" ]]; then
  search_call=$(curl -s -X POST "${BASE_URL}/api/mcp" "${mcp_headers[@]}" -d '{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"search_blog_posts","arguments":{"q":"docker"}}}')
  echo "${search_call}" | grep -q '"result"' || fail "mcp search_blog_posts (${search_call})"
  if echo "${search_call}" | grep -q 'upstream_search_unavailable'; then
    echo "${search_call}" | grep -q '"isError":true' || fail "mcp search_blog_posts upstream error missing isError (${search_call})"
    pass "mcp search_blog_posts upstream error signaling"
  elif echo "${search_call}" | grep -q 'response'; then
    pass "mcp search_blog_posts"
  else
    fail "mcp search_blog_posts unexpected payload (${search_call})"
  fi
else
  pass "mcp search_blog_posts skipped (blog off)"
fi

# llms.txt should omit blog URLs when blog off (AE3)
llms_body=$(curl -s "${BASE_URL}/llms.txt")
echo "${llms_body}" | grep -q '/overview' || fail "llms.txt missing /overview"
if [[ "${FEATURE_BLOG}" != "1" ]]; then
  echo "${llms_body}" | grep -Eqi '/blog|/api/search-posts' && fail "llms.txt still advertises blog (blog off)"
fi
pass "llms.txt module surfaces"

echo "All agent-readiness smoke checks passed."
