import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { FormEvent, ReactNode } from "react";
import { Button } from "#frontend/components/primitives/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "#frontend/components/primitives/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormMessage,
  FormSubmit,
} from "#frontend/components/primitives/form";
import { Cross } from "#frontend/components/ui/icon";
import { useCurrentBoardId } from "#frontend/store/board";
import {
  getApiBoardsOptions,
  postApiBoardcolumnsMutation,
} from "#frontend/types/generated/@tanstack/react-query.gen";
import { zCreateBoardColumnRequest } from "#frontend/types/generated/zod.gen";
import { formDataToObject } from "#frontend/utils/object";
import { makeZodErrorsUserFriendly } from "#frontend/utils/zod";

type CreateBoardColumnDialogProps = {
  trigger: ReactNode;
};

export function CreateBoardColumnDialog({
  trigger = <Button>+New Column</Button>,
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
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        aria-describedby="create board column dialog"
        showCloseButton={false}
      >
        <DialogTitle>Add New Column</DialogTitle>
        <Form onSubmit={handleSubmit}>
          <FormField name="column-name">
            <FormControl placeholder="e.g. To Do" required />
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
