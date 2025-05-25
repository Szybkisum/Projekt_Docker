type SimpleButtonProps = {
  text: string;
  action?: () => void;
};

export default function SimpleButton({
  text,
  action = () => {},
}: SimpleButtonProps) {
  return <button onClick={() => action()}>{text}</button>;
}
