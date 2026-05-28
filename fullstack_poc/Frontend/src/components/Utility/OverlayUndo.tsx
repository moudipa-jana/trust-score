{
  /**
   * OverlayUndo displays a message with an undo button, typically used for actions like hiding posts.
   * Allows users to revert the action by clicking the provided button.
   */
}
import Text from '@/elements/Text';

import Button from './Button';

function OverlayUndo({
  onClick,
  message,
}: {
  onClick: () => void;
  message?: string;
}) {
  return (
    <div className="overlay-undo">
      <Text color="text-black" size="lg">
        {message
          ? message
          : 'This post has been hidden, You will not see this post further'}
      </Text>
      <div className="mt-4">
        <Button size="lg" onClick={onClick}>
          <span style={{ width: '300px' }}>Undo</span>
        </Button>
      </div>
    </div>
  );
}

export default OverlayUndo;
