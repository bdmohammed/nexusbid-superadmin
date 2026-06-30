"use client";

import Avatar from "@/components/common/Avatar";
import StatusBadge from "@/components/common/StatusBadge";
import Button from "@/components/ui/Button";
import { ArrowLeft, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UserProfileHeader({ user }) {

  const router = useRouter();

  return (

    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">

      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

        <div className="flex items-center gap-5">

          <Avatar
            name={`${user.firstName} ${user.lastName}`}
            size="xl"
          />

          <div>

            <h2 className="text-3xl font-bold">

              {user.firstName} {user.lastName}

            </h2>

            <p className="mt-1 text-text-light">

              {user.email}

            </p>

            <div className="mt-4 flex flex-wrap gap-2">

              <StatusBadge status={user.status}/>

              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">

                {user.role}

              </span>

            </div>

          </div>

        </div>

        <div className="flex gap-3">

          <Button
            variant="secondary"
            leftIcon={ArrowLeft}
            onClick={()=>router.back()}
          >
            Back
          </Button>

          <Button leftIcon={Pencil}>

            Edit User

          </Button>

        </div>

      </div>

    </div>

  );

}