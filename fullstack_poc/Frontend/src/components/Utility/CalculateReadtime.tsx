{
  /**
   * CalculateReadTime estimates total read time based on the combined word count of provided texts.
   * extractAndCalculateReadTime extracts text content from a structured data object and calculates its read time.
   */
}
import React from 'react';

interface BlogFold {
  Title?: string;
  description?: string;
}

interface BlogData {
  attributes?: {
    Title?: string;
    shortDes?: string;
    firstFold?: BlogFold;
    secondFold?: BlogFold;
    thirdFold?: BlogFold;
    fourthFold?: BlogFold;
    fifthFold?: BlogFold;
    sixthFold?: BlogFold;
    seventhFold?: BlogFold;
    eighthFold?: BlogFold;
    ninthFold?: BlogFold;
    tenthFold?: BlogFold;
    eleventhFold?: BlogFold;
    twelfthFold?: BlogFold;
    thirteenthFold?: BlogFold;
    fourteenthFold?: BlogFold;
    fifteenthFold?: BlogFold;
  };
}

type CalculateReadTimeProps = {
  textRead: string[];
};

const CalculateReadTime: React.FC<CalculateReadTimeProps> = ({ textRead }) => {
  let totalReadTime = 1;

  textRead.forEach((text) => {
    const wordCount = text && text.split(' ').length;
    const readingSpeed = 200; // Words per minute
    const time = wordCount && wordCount / readingSpeed;
    if (time) {
      totalReadTime += time;
    }
  });
  const roundedTime = Math.ceil(parseFloat(totalReadTime.toFixed(2)));

  return <>{roundedTime} min read</>;
};

const extractAndCalculateReadTime = (data: BlogData) => {
  try {
    const textRead: string[] = [
      data?.attributes?.Title as string,
      data?.attributes?.shortDes as string,
      data?.attributes?.firstFold?.Title as string,
      data?.attributes?.firstFold?.description as string,
      data?.attributes?.secondFold?.Title as string,
      data?.attributes?.secondFold?.description as string,
      data?.attributes?.thirdFold?.Title as string,
      data?.attributes?.thirdFold?.description as string,
      data?.attributes?.fourthFold?.Title as string,
      data?.attributes?.fourthFold?.description as string,
      data?.attributes?.fifthFold?.Title as string,
      data?.attributes?.fifthFold?.description as string,
      data?.attributes?.sixthFold?.Title as string,
      data?.attributes?.sixthFold?.description as string,
      data?.attributes?.seventhFold?.Title as string,
      data?.attributes?.seventhFold?.description as string,
      data?.attributes?.eighthFold?.Title as string,
      data?.attributes?.eighthFold?.description as string,
      data?.attributes?.ninthFold?.Title as string,
      data?.attributes?.ninthFold?.description as string,
      data?.attributes?.tenthFold?.Title as string,
      data?.attributes?.tenthFold?.description as string,
      data?.attributes?.eleventhFold?.Title as string,
      data?.attributes?.eleventhFold?.description as string,
      data?.attributes?.twelfthFold?.Title as string,
      data?.attributes?.twelfthFold?.description as string,
      data?.attributes?.thirteenthFold?.Title as string,
      data?.attributes?.thirteenthFold?.description as string,
      data?.attributes?.fourteenthFold?.Title as string,
      data?.attributes?.fourteenthFold?.description as string,
      data?.attributes?.fifteenthFold?.Title as string,
      data?.attributes?.fifteenthFold?.description as string,
    ];

    const calculatedReadTime = CalculateReadTime({
      textRead,
    });

    return calculatedReadTime;
  } catch (error) {
    return <>1 min read</>;
  }
};

export default extractAndCalculateReadTime;
