import React from 'react';

import Heading from '@/elements/Heading';
import Text from '@/elements/Text';

export default function ContactHeader() {
  return (
    <div className="sm-container py-10 xl:py-20">
      <div className=" contact-heding">
        <Heading color="text-black-950" priority={2} font="font-medium">
          Contact Us
        </Heading>
        <div className=" xl:mx-0">
          <Text variant font="font-normal" color="text-black-1000" size="lg">
            <span className="xl:text-xl">
              Please let us know what service you are interested in by
              completing the form below. We will get in touch with you shortly.
            </span>
          </Text>
        </div>
      </div>
    </div>
  );
}
