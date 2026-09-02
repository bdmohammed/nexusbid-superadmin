//@ts-nocheck
import dayjs from 'dayjs';

import {
  AccountTypeCellRenderer,
  ActionsCellRenderer,
  AssignedRoleCellRenderer,
  EmailCellRenderer,
  ExpireDateCellRenderer,
  IsVerifiedCellRenderer,
  NameCellRenderer,
  StatusCellRenderer,
} from './cellRenderers';

import type { UserRoleAssignment } from '@/features/rbac/types';
import type { ColDef } from 'ag-grid-community';

export function getRoleAssignmentColumnDefs(
  onDeleteAssignment: (id: string) => void,
  onViewDetails?: (assignment: UserRoleAssignment) => void,
  onSubmitForReview?: (assignment: UserRoleAssignment) => void,
  onApproveAssignment?: (assignment: UserRoleAssignment) => void,
  onRejectAssignment?: (assignment: UserRoleAssignment) => void,
  currentUserId?: string,
): ColDef<UserRoleAssignment>[] {
  return [
    {
      headerName: 'Name',
      field: 'user.name',
      width: 200,
      enableRowGroup: true,
      cellClass: 'v-align',
      cellRenderer: NameCellRenderer,
    },
    {
      headerName: 'Email',
      field: 'user.email',
      width: 230,
      enableRowGroup: true,
      cellClass: 'v-align',
      cellRenderer: EmailCellRenderer,
    },
    {
      headerName: 'Assigned Role',
      field: 'role.name',
      width: 180,
      enableRowGroup: true,
      cellClass: 'v-align',
      cellRenderer: AssignedRoleCellRenderer,
    },
    {
      headerName: 'Governance Status',
      field: 'status',
      width: 160,
      enableRowGroup: true,
      cellClass: 'v-align',
      cellRenderer: StatusCellRenderer,
    },
    {
      headerName: 'Assigned Reviewer',
      field: 'reviewer.name',
      width: 170,
      enableRowGroup: true,
      cellClass: 'v-align',
      valueGetter: (params) => {
        if (params.data?.reviewer?.name) return params.data.reviewer.name;
        if (params.data?.reviewer?.email) return params.data.reviewer.email;
        if (params.data?.assignedBy?.name) return params.data.assignedBy.name;
        return 'Not Assigned';
      },
    },
    {
      headerName: 'Reason / Comment',
      field: 'reason',
      width: 220,
      enableRowGroup: true,
      cellClass: 'v-align',
      valueGetter: (params) => params.data?.reason || params.data?.comment || '—',
    },
    {
      headerName: 'Account Type',
      field: 'user.accountType',
      width: 130,
      enableRowGroup: true,
      cellClass: 'v-align',
      cellRenderer: AccountTypeCellRenderer,
    },
    {
      headerName: 'Is Verified',
      field: 'user.emailVerified',
      width: 120,
      enableRowGroup: true,
      cellClass: 'v-align',
      cellRenderer: IsVerifiedCellRenderer,
    },
    {
      headerName: 'Assigned Date',
      field: 'assignedAt',
      width: 170,
      enableRowGroup: true,
      cellClass: 'v-align',
      valueGetter: (params) => params.data?.createdAt,
      // params.data?.assignedAt || params.data?.createdAt,
      valueFormatter: (params) =>
        params.value ? dayjs(params.value).format('DD MMM YYYY, hh:mm A') : '—',
    },
    {
      headerName: 'Expire Date',
      field: 'expiresAt',
      width: 170,
      enableRowGroup: true,
      cellClass: 'v-align',
      cellRenderer: ExpireDateCellRenderer,
    },
    {
      headerName: 'Actions',
      width: 170,
      sortable: false,
      filter: false,
      pinned: 'right',
      cellClass: 'v-align',
      cellRenderer: ActionsCellRenderer,
      cellRendererParams: {
        currentUserId,
        onDeleteAssignment,
        onViewDetails,
        onSubmitForReview,
        onApproveAssignment,
        onRejectAssignment,
      },
    },
  ];
}
