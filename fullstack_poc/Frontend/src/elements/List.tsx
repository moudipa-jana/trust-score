function List({
  children,
  type,
  size,
}: {
  children: JSX.Element | string;
  type?: string;
  size?: string;
}) {
  return (
    <li
      className={`${
        type == 'primary'
          ? 'list-disc text-primary'
          : 'list-none text-black-100'
      } ${
        size == 'sm'
          ? 'text-sm'
          : size == 'md'
            ? 'text-md'
            : size == 'lg'
              ? 'text-lg'
              : 'text-base'
      }`}
    >
      {children}
    </li>
  );
}

export default List;
