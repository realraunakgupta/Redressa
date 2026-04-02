"use client";

import { ReactNode, useState, useEffect } from "react";
import { Panel, Group, Separator } from "react-resizable-panels";

interface ResizableLayoutProps {
  leftContent: ReactNode;
  rightContent: ReactNode;
}

export function ResizableLayout({ leftContent, rightContent }: ResizableLayoutProps) {
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const checkWidth = () => setIsDesktop(window.innerWidth >= 1024);
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  if (!isDesktop) {
    return (
      <div className="flex flex-col gap-8 w-full min-w-0">
        <div className="w-full flex-1 min-w-0">{leftContent}</div>
        <div className="w-full flex-1 min-w-0">{rightContent}</div>
      </div>
    );
  }

  return (
    <Group orientation="horizontal" className="w-full min-w-0 items-start flex">
      <Panel defaultSize={65} minSize={30} className="min-w-0">
        <div className="pr-4">{leftContent}</div>
      </Panel>
      <Separator className="w-2 mx-1 rounded-full bg-[var(--color-border-ghost)] hover:bg-[var(--color-border-solid)] active:bg-primary transition-colors cursor-col-resize shrink-0 self-stretch" />
      <Panel defaultSize={35} minSize={25} className="min-w-0">
        <div className="pl-4">{rightContent}</div>
      </Panel>
    </Group>
  );
}
