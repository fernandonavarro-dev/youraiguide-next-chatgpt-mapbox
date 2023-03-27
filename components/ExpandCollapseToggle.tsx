import React from 'react';

interface ExpandCollapseToggleProps {
  expanded: boolean;
  onToggleExpand: () => void;
}

export const ExpandCollapseToggle: React.FC<ExpandCollapseToggleProps> = ({
  expanded,
  onToggleExpand,
}) => {
  return (
    <button
      className="focus:outline-none"
      onClick={onToggleExpand}
      title={expanded ? 'Collapse' : 'Expand'}
    >
      {expanded ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-gray-300"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-gray-300"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 15l7-7 7 7"
          />
        </svg>
      )}
    </button>
  );
};
