import React from 'react';

import Button from '@/components/Utility/Button';
import Text from '@/elements/Text';
import useIsMobile from '@/Hooks/useIsMobile';

function ExporeJobs() {
  const isMobile = useIsMobile();
  function scrollToSection(id: string) {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        behavior: 'smooth',
        top: element.offsetTop,
      });
    }
  }
  return (
    <>
      <div className="sm-container">
        <Text color="text-black" font="font-bold" size="xxl">
          JOIN THE TRIBE
        </Text>
      </div>
      <div className="sm-container flex items-center justify-start py-6">
        <Button
          type="secondary"
          onClick={() => scrollToSection('Current openings')}
          block={isMobile && true}
        >
          Explore our jobs
        </Button>
      </div>
    </>
  );
}

export default ExporeJobs;
