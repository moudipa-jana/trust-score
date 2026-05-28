import Heading from '@/elements/Heading';
import Text from '@/elements/Text';

interface Props {
  heading: string;
  description: string;
}
function About({ heading, description }: Props) {
  return (
    <div className="my-8 rounded-lg bg-secondary p-4">
      <Heading priority="3" variant color="text-white" font="font-bold">
        {heading}
      </Heading>
      <div className="pt-2 leading-normal">
        <Text size="md" color="text-white">
          {description}
        </Text>
      </div>
    </div>
  );
}

export default About;
