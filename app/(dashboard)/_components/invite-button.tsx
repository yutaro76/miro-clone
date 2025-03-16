import { Plus } from "lucide-react";
import { OrganizationProfile } from "@clerk/nextjs";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Description } from "@radix-ui/react-dialog";

export const InviteButton = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          invite members
        </Button>
      </DialogTrigger>
      <DialogContent className="p-0 bg-transparent border-none max-w-[880px]">
        <OrganizationProfile />
        {/* 以下の二つはエラーが出ないようにするため */}
        <DialogTitle className="sr-only">Title</DialogTitle>
        <Description className="sr-only">Description</Description>
      </DialogContent>
    </Dialog>
  );
};
