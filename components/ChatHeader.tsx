// ChatHeader.tsx
import React from 'react';
import { ExpandCollapseToggle } from './ExpandCollapseToggle';

type ChatHeaderProps = {
  expanded: boolean;
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>;
};

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  expanded,
  setExpanded,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="text-xl font-semibold mb-4">ChatGPT Location Guide</div>
      <ExpandCollapseToggle
        expanded={expanded}
        onToggleExpand={() => setExpanded(!expanded)}
      />
    </div>
  );
};
