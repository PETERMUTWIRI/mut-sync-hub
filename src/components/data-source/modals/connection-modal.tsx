"use client";

import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { ApiForm } from "./api-form";
import { DbForm } from "./db-form";
import { FileForm } from "./file-form";
import { WebhookForm } from "./webhook-form";

const titles: Record<string, string> = {
  api: "REST / GraphQL API",
  database: "SQL Database",
  file: "File / CSV drop",
  webhook: "Webhook inbox",
};

export function ConnectionModal({
  open,
  setOpen,
  type,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  type: string | null;
}) {
  if (!type) return null;

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={setOpen}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/70" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-[#1E2A44] p-6 text-white align-middle shadow-xl transition-all border border-teal-400/20">
                <div className="flex items-center justify-between">
                  <Dialog.Title as="h3" className="text-lg font-semibold">{titles[type]}</Dialog.Title>
                  <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white">
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="mt-4">
                  {type === "api" && <ApiForm onSuccess={() => setOpen(false)} />}
                  {type === "database" && <DbForm onSuccess={() => setOpen(false)} />}
                  {type === "file" && <FileForm onSuccess={() => setOpen(false)} />}
                  {type === "webhook" && <WebhookForm onSuccess={() => setOpen(false)} />}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
