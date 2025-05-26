type SimpleButtonProps = {
  text: string;
  action?: () => void;
  disabled?: boolean;
};

export default function SimpleButton({
  text,
  action = () => {},
  disabled,
}: SimpleButtonProps) {
  return <button onClick={() => action()}>{text}</button>;
}
