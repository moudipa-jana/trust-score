{
  /**
   * Accordion displays a collapsible section for FAQs or toggleable content.
   * It shows a question header with expand/collapse icons and reveals the answer when open.
   */
}
import React from 'react';
import { RiArrowDownSLine, RiArrowUpSLine } from 'react-icons/ri';

import Text from '@/elements/Text';

interface AccordionProps {
  question: string;
  answer: string;
  faq: {
    id: string;
  };
  open: boolean;
  toggle: (id: string) => void;
  index: number;
}

function Accordion({
  question,
  answer,
  faq,
  open,
  toggle,
  index,
}: AccordionProps) {
  return (
    <>
      <div
        className="flex cursor-pointer items-center justify-between p-4"
        onClick={() => toggle(faq.id)}
        data-index={index}
      >
        <Text size="xl" variant>
          {question}
        </Text>
        <div>
          {open ? (
            <RiArrowUpSLine className="text-2xl" />
          ) : (
            <RiArrowDownSLine className="text-2xl" />
          )}
        </div>
      </div>
      {open && (
        <div className="pl-4 pr-4 pb-4 pt-2">
          <Text size="" font="font-medium">
            {answer}
          </Text>
        </div>
      )}
    </>
  );
}

export default Accordion;
