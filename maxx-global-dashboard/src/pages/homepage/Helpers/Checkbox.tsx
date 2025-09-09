type CheckboxProps = {
  id?: string;
  name?: string;
  handleChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  checked?: boolean;
  className?: string;
};

export default function Checkbox({
  id,
  name,
  handleChange,
  checked,
  className,
}: CheckboxProps) {
  return (
    <div>
      <input
        className={className}
        id={id}
        type="checkbox"
        name={name}
        onChange={handleChange}
        checked={checked}
      />
    </div>
  );
}
