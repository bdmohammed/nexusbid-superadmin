export default function UserPurchaseTable() {
  const purchases = [
    {
      id: "INV-1001",
      item: "Enterprise Subscription",
      amount: "₹4,999",
      date: "25 Jun 2026",
      status: "Paid",
    },
    {
      id: "INV-1002",
      item: "Tender Package",
      amount: "₹12,000",
      date: "10 Jun 2026",
      status: "Paid",
    },
    {
      id: "INV-1003",
      item: "Premium Listing",
      amount: "₹2,500",
      date: "01 Jun 2026",
      status: "Paid",
    },
  ];

  return (
    <div className="rounded-2xl border border-border bg-surface shadow-sm">

      <div className="border-b border-border px-6 py-4">
        <h3 className="text-lg font-semibold">
          Purchase History
        </h3>
      </div>

      <div className="overflow-x-auto">

        <table className="min-w-full">

          <thead className="bg-background">

            <tr>

              <th className="px-6 py-4 text-left">
                Invoice
              </th>

              <th className="px-6 py-4 text-left">
                Item
              </th>

              <th className="px-6 py-4 text-left">
                Amount
              </th>

              <th className="px-6 py-4 text-left">
                Date
              </th>

              <th className="px-6 py-4 text-left">
                Status
              </th>

            </tr>

          </thead>

          <tbody>

            {purchases.map((item) => (

              <tr
                key={item.id}
                className="border-t border-border"
              >

                <td className="px-6 py-4">
                  {item.id}
                </td>

                <td className="px-6 py-4">
                  {item.item}
                </td>

                <td className="px-6 py-4">
                  {item.amount}
                </td>

                <td className="px-6 py-4">
                  {item.date}
                </td>

                <td className="px-6 py-4">

                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                    {item.status}
                  </span>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}