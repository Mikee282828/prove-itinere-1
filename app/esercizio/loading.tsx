import { Loader } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-auto items-center justify-center ">
      <Loader className="size-24 animate-spin" />
    </div>
  );
}
