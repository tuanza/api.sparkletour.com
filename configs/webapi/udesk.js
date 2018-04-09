const base_v1 = "http://sparkletour.udesk.cn/open_api_v1"
const config = {
    LOGIN: base_v1 + "/log_in",
    tickets: base_v1 + "/tickets",
    tickets_in_filter: base_v1 + "/tickets/tickets_in_filter",
    tickets_detail: base_v1 + "/tickets/detail",
    tickets_custom_fields: base_v1 + '/tickets/custom_fields',
    customers: base_v1 + '/customers',
    customers_get_customer: base_v1 + '/customers/get_customer',
    customers_custom_fields: base_v1 + '/customers/custom_fields',
    agents: base_v1 + '/agents'
}
module.exports = config;
