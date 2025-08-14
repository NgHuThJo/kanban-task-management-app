import { Button } from "#frontend/components/primitives/button";
import {
  Form,
  FormControl,
  FormField,
  FormMessage,
  FormSubmit,
} from "#frontend/components/primitives/form";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "#frontend/components/primitives/dialog";
import { Cross } from "#frontend/components/ui/icon";
import type { FormEvent } from "react";
import {
  getApiBoardsOptions,
  postApiBoardcolumnsMutation,
} from "#frontend/types/generated/@tanstack/react-query.gen";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formDataToObject } from "#frontend/utils/object";
import { useCurrentBoardId } from "#frontend/store/board";
import { zCreateBoardColumnRequest } from "#frontend/types/generated/zod.gen";
import { makeZodErrorsUserFriendly } from "#frontend/utils/zod";

type CreateBoardColumnDialogProps = {
  triggerButtonText: string;
};

export function CreateBoardColumnDialog({
  triggerButtonText,
}: CreateBoardColumnDialogProps) {
  const currentBoardId = useCurrentBoardId();
  const queryClient = useQueryClient();
  const { isPending, mutate } = useMutation({
    ...postApiBoardcolumnsMutation(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: getApiBoardsOptions().queryKey,
      });
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const convertedFormData = formDataToObject(formData);
    const boardColumnName = convertedFormData["column-name"];

    const payload = {
      boardId: currentBoardId,
      name: boardColumnName,
    };

    const validatedResult = zCreateBoardColumnRequest.safeParse(payload);

    if (!validatedResult.success) {
      const formattedErrors = makeZodErrorsUserFriendly(validatedResult.error);
      console.log("Form errors in create board column:", formattedErrors);

      // setValidationErrors(formattedErrors);
    } else {
      mutate({
        body: validatedResult.data,
      });
    }
  };

  if (isPending) {
    return <p>Sending request...</p>;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="select" size="select">
          {triggerButtonText}
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby="" showCloseButton={false}>
        <DialogTitle>Add New Column</DialogTitle>
        <Form onSubmit={handleSubmit}>
          <FormField name="column-name">
            <FormControl placeholder="e.g. To Do" />
            <FormMessage match="valueMissing">
              Please enter a board column name
            </FormMessage>
          </FormField>
          <FormSubmit asChild>
            <Button>Create New Column</Button>
          </FormSubmit>
        </Form>
        <DialogClose asChild>
          <Button variant="ghost" size="icon">
            <Cross />
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
