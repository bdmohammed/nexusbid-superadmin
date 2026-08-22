import { useMutation } from "@tanstack/react-query";

import { supportApi } from "./api";

import type { ContactDto } from "../types";

export function useSubmitContact() {
  return useMutation({
    mutationFn: (dto: ContactDto) => supportApi.submitContact(dto),
  });
}
