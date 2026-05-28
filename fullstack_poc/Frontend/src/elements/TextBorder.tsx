import Text from './Text';

function TextBorder({ text, top }: { text: string; top?: boolean }) {
  return (
    <div className="relative mb-4  text-center">
      <Text
        size="lg"
        italic="italic"
        customClass={`border-b-2 border-primary hori-line ${
          top ? 'mt-4' : ''
        } mb-4 leading-none`}
      >
        <span className="relative top-3 bg-white px-4 text-lg lg:text-2xl">
          {text}
        </span>
      </Text>
    </div>
  );
}

export default TextBorder;
