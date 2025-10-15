// temp stubs until you plug real endpoints
export const getCurrentPlan = async () => ({ data: { name: 'Free', price: 0 } });
export const getInvoices     = async () => ({ data: [] });
export const getPaymentMethods = async () => ({ data: [] });
export const deletePaymentMethod = async (id: string) => {};
