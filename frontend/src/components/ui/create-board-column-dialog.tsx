import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent, type ReactNode } from "react";
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
  const [isOpen, setIsOpen] = useState(false);
  const [errors, setErrors] = useState<{
    client: {
      [key: string]: string[];
    };
    server: string | null | undefined;
  }>({
    client: {},
    server: null,
  });
  const queryClient = useQueryClient();
  const { isPending, mutate } = useMutation({
    ...postApiBoardcolumnsMutation(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: getApiBoardsOptions().queryKey,
      });
      setIsOpen(false);
    },
    onError: (error) => {
      setErrors((prev) => ({
        ...prev,
        server: error.detail,
      }));
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
      // console.log("Form errors in create board column:", formattedErrors);

      setErrors((prev) => ({
        ...prev,
        client: formattedErrors,
      }));
    } else {
      mutate({
        body: validatedResult.data,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent aria-describedby={undefined} showCloseButton={false}>
        <DialogTitle>Add New Column</DialogTitle>
        <Form
          onSubmit={handleSubmit}
          onClearServerErrors={() => {
            setErrors({
              client: {},
              server: null,
            });
          }}
        >
          <FormField
            name="column-name"
            serverInvalid={typeof errors.server === "string"}
          >
            <FormControl placeholder="e.g. To Do" required />
            <FormMessage match="valueMissing">
              Please enter a board column name
            </FormMessage>
            {errors.server && <FormMessage>{errors.server}</FormMessage>}
          </FormField>
          <FormSubmit asChild>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create New Column"}
            </Button>
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
