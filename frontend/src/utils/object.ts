// type RefinedFormData<
//   Single extends readonly string[],
//   Multi extends readonly string[],
// > = {
//   [K in Single[number]]: FormDataEntryValue;
// } & {
//   [K in Multi[number]]: FormDataEntryValue[];
// };

export function formDataToObject(formData: FormData) {
  const convertedFormData = Array.from(formData.entries()).reduce<{
    [Key: string]: FormDataEntryValue | FormDataEntryValue[];
  }>((acc, [key, value]) => {
    if (acc[key] !== undefined) {
      acc[key] = Array.isArray(acc[key])
        ? [...acc[key], value]
        : [acc[key], value];
    } else {
      acc[key] = value;
    }

    return acc;
  }, {});

  return convertedFormData;
}
