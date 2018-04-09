var db = {
    baseUrl: "mongodb://127.0.0.1:27017",//mongodb://172.18.2.187:33017
    dbName: "spdb",
    collections: {
        counters: "counters",
        product: "product",
        ticket: "ticket",
        ticket_cusfield: "ticket_cusfield",
        customer: "customer",
        customer_cusfield: "customer_cusfield",
        customer_point_type: "customer_point_type",
        agent: "agents",
        upload_file: "upload_file",
        user_role: "user_role",
        advertisement: "advertisement",
        geo_city: "geo_city",
        flight: "flight",
        card: "card",
        label: "label",
        news:"news"
    }
}
module.exports = db