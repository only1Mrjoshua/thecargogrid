// src/utils/helpers.js
export const isCustomsStatus = (status) => {
  const customsStatuses = ['Customs', 'Customs Hold', 'Customs Fee Pending', 'customs', 'customs_hold'];
  return customsStatuses.includes(status);
};