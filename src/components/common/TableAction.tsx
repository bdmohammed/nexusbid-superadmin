import { Download, RefreshCcw } from "lucide-react";
import Button from "../ui/Button";

export default function TableAction() {
  return (
    <div className="flex flex-nowrap items-center gap-2">
      <Button variant="secondary" leftIcon={RefreshCcw}>
        Refresh
      </Button>

      <Button variant="secondary" leftIcon={Download}>
        Export
      </Button>
    </div>
  );
}
