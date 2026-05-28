import Button from '@/components/Utility/Button';
import Heading from '@/elements/Heading';
import Text from '@/elements/Text';
import { useIsDesktop } from '@/Hooks/useIsDesktop';

function Welcome({
  setFormSteps,
}: {
  setFormSteps: (newStep: number) => void;
}) {
  const isdesktop = useIsDesktop();
  return (
    <div className={`campfire-modal relative z-20 ${isdesktop ? 'px-16' : ''}`}>
      <div className="pt-10 ">
        <Heading priority={3} variant font="font-medium">
          Welcome to campfire
        </Heading>
        <div className="py-1 pb-4">
          <Text size="base" color="text-black-900" font="font-light">
            Follow and create communities to explore your interest on Kofuku
          </Text>
        </div>
        <div className="grid grid-cols-2 gap-2 lg:mt-2">
          <div onClick={() => setFormSteps(1)}>
            <Button block>Create</Button>
          </div>

          <div onClick={() => setFormSteps(2)}>
            <Button block>Explore</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Welcome;
