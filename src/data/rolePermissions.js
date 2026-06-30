const rolePermissions = [
  {
    category: "Marketplace",
    permissions: [
      "Dashboard",
      "Users",
      "Categories",
      "Subscriptions",
      "Role Assignment",
      "Analytics",
      "Settings",
    ],
  },

  {
    category: "Tender Management",
    permissions: [
      "View Tenders",
      "Create Tender",
      "Edit Tender",
      "Delete Tender",
      "Publish Tender",
      "Approve Tender",
    ],
  },

  {
    category: "Vendor Management",
    permissions: [
      "View Vendors",
      "Approve Vendor",
      "Suspend Vendor",
      "Delete Vendor",
    ],
  },

  {
    category: "Subscription",
    permissions: [
      "Create Plan",
      "Edit Plan",
      "Delete Plan",
      "View Payments",
      "Refund Payments",
    ],
  },

  {
    category: "Reports",
    permissions: [
      "View Reports",
      "Export Reports",
      "Financial Reports",
      "Audit Logs",
    ],
  },

  {
    category: "System",
    permissions: [
      "Application Settings",
      "Email Configuration",
      "Backup & Restore",
      "API Management",
      "Security Logs",
    ],
  },
];

export default rolePermissions;