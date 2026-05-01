export const isUnsupportedJsonFormat = (err: any) => {
  return (
    err?.code === 400 &&
    err?.status === 'INVALID_ARGUMENT' &&
    err?.message.includes('JSON mode')
  );
};
