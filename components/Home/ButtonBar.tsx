"use client";

import {
  AiOutlineDownload,
  AiOutlineInfoCircle,
  AiOutlineMessage,
  AiOutlineRead,
  AiOutlineTeam,
} from "react-icons/ai";

import { PUBLIC_FEATURE_BLOG, PUBLIC_FEATURE_CONTACT } from "@lib/features";

import { ButtonBarContainer } from "@components/common/Layout/ButtonBarContainer";
import { SocialIcons } from "@components/common/Layout/SocialIcons";
import { trackPixelEvent } from "@lib/pixel";

export default function ButtonBar() {
  const lastIsContact = PUBLIC_FEATURE_CONTACT;
  const lastIsBlog = !lastIsContact && PUBLIC_FEATURE_BLOG;
  const lastIsCommunity = !lastIsContact && !lastIsBlog;

  return (
    <ButtonBarContainer>
      <SocialIcons
        href="/overview"
        icon={AiOutlineInfoCircle}
        text="Overview"
        className="!rounded-l-[5px]"
      />
      <SocialIcons href="/install" icon={AiOutlineDownload} text="Install" />
      <SocialIcons
        href="/community"
        icon={AiOutlineTeam}
        text="Community"
        className={lastIsCommunity ? "!rounded-r-[5px]" : undefined}
      />
      {PUBLIC_FEATURE_BLOG && (
        <SocialIcons
          href="/blog"
          icon={AiOutlineRead}
          text="Blog"
          className={lastIsBlog ? "!rounded-r-[5px]" : undefined}
        />
      )}
      {PUBLIC_FEATURE_CONTACT && (
        <SocialIcons
          href="/contact"
          icon={AiOutlineMessage}
          text="Contact"
          onClick={() => trackPixelEvent("ClickHeaderContact")}
          className="!rounded-r-[5px]"
        />
      )}
    </ButtonBarContainer>
  );
}
