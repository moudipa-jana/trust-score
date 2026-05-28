import Heading from '@/elements/Heading';
interface Ilable {
  required?: boolean;
  title: string;
  color?: string;
  variant?: boolean;
}

function Label({ required, title, color, variant }: Ilable) {
  return (
    <div className="flex gap-1">
      <Heading
        priority={variant ? 2 : 6}
        variant={variant}
        color={color}
        font="font-semibold"
      >
        {title}
      </Heading>
      {required && <div className="text-xs text-error">*</div>}
    </div>
  );
}

export default Label;
