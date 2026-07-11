"use client";

import { DiscussionEmbed } from "disqus-react";

type DisqusCommentsProps = {
  shortname: string;
  identifier: string;
  url: string;
  title: string;
};

/** Client-only Disqus embed. Mount only when shortname is configured (R7). */
export function DisqusComments({
  shortname,
  identifier,
  url,
  title,
}: DisqusCommentsProps) {
  return (
    <div className="mt-16 border-t border-black/10 pt-10">
      <DiscussionEmbed
        shortname={shortname}
        config={{
          identifier,
          url,
          title,
        }}
      />
    </div>
  );
}
