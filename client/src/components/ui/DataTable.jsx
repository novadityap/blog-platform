'use client';

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@/components/shadcn/table';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { createColumnHelper } from '@tanstack/react-table';
import {
  TbEdit,
  TbTrash,
  TbPlus,
  TbEye,
  TbArrowUp,
  TbArrowDown,
  TbArrowsSort,
  TbMoodSad,
} from 'react-icons/tb';
import { Input } from '@/components/shadcn/input';
import { Button } from '@/components/shadcn/button';
import { Skeleton } from '@/components/shadcn/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn/select';
import dayjs from 'dayjs';
import RemoveConfirmModal from '@/components/ui/RemoveConfirmModal';
import CreateUpdateModal from '@/components/ui/CreateUpdateModal';
import Pagination from '@/components/ui/Pagination';

const PageSizeSelector = ({ value, onChange }) => (
  <div className="flex items-center gap-x-3 w-16 text-sm">
    <span>Show</span>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="10" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={10}>10</SelectItem>
        <SelectItem value={25}>25</SelectItem>
        <SelectItem value={50}>50</SelectItem>
      </SelectContent>
    </Select>
    <span>entries</span>
  </div>
);

const DataTable = ({
  searchQuery,
  removeMutation,
  columns,
  FormComponent,
  allowView = false,
  allowCreate = true,
  allowUpdate = true,
  entityName,
}) => {
  const columnsHelper = createColumnHelper();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setcurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [modalType, setModalType] = useState(null);
  const [selectedParentId, setSelectedParentId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [sorting, setSorting] = useState([]);
  const {
    data: items,
    isLoading: isItemsLoading,
    isFetching: isItemsFetching,
  } = searchQuery(
    {
      page: searchTerm ? 1 : currentPage,
      limit,
      q: searchTerm,
      sortBy: sorting[0]?.id || 'createdAt',
      sortOrder: sorting[0]?.desc ? 'desc' : 'asc',
    },
    {
      refetchOnMountOrArgChange: true,
    }
  );
  const [removeMutate, { isLoading: isRemoveLoading }] = removeMutation();
  const mergedColumns = [
    columnsHelper.display({
      header: '#',
      enableSorting: false,
      size: 30,
      cell: info =>
        searchTerm
          ? info.row.index + 1
          : info.row.index + 1 + (currentPage - 1) * items?.meta?.pageSize,
    }),
    ...columns,
    columnsHelper.accessor('createdAt', {
      header: 'Created At',
      size: 120,
      cell: info => (
        <div className="whitespace-normal break-words text-wrap">
          {dayjs(info.getValue()).format('DD MMM YYYY hh:mm A')}
        </div>
      ),
    }),
    columnsHelper.accessor('updatedAt', {
      header: 'Updated At',
      size: 120,
      cell: info => (
        <div className="whitespace-normal break-words text-wrap">
          {dayjs(info.getValue()).format('DD MMM YYYY hh:mm A')}
        </div>
      ),
    }),
    columnsHelper.display({
      header: 'Actions',
      enableSorting: false,
      size: 100,
      cell: ({ row }) => {
        const id = row.original.id;
        const postId = row.original?.post?.id;

        return (
          <div className="flex gap-x-3">
            {allowView && (
              <TbEye
                className="size-5 cursor-pointer text-blue-600"
                onClick={() => handleOpenModal('view', id)}
              />
            )}
            {allowUpdate && (
              <TbEdit
                className="size-5 cursor-pointer text-orange-600"
                onClick={() => handleOpenModal('update', id)}
              />
            )}
            <TbTrash
              className="size-5 cursor-pointer text-red-600"
              onClick={() => handleOpenModal('remove', id, postId)}
            />
          </div>
        );
      },
    }),
  ];

  const handleOpenModal = (type, id = null, parentId = null) => {
    setModalType(type);
    setSelectedId(id);
    setSelectedParentId(parentId);
  };

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedId(null);
  };

  const handleRemoveConfirm = async () => {
    try {
      const result =
        entityName === 'comment'
          ? await removeMutate({
              postId: selectedParentId,
              commentId: selectedId,
            }).unwrap()
          : await removeMutate(selectedId).unwrap();
      toast.success(result.message);
      handleCloseModal();
    } catch (e) {
      toast.error('Failed to remove item');
    }
  };

  const table = useReactTable({
    data: items?.data || [],
    columns: mergedColumns,
    getCoreRowModel: getCoreRowModel(),
    manualFiltering: true,
    manualSorting: true,
    manualPagination: true,
    pageCount: items?.meta?.totalPages || 0,
    rowCount: items?.meta?.totalItems || 0,
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  useEffect(() => {
    if (items?.meta) {
      if (currentPage > items.meta.totalPages) {
        setcurrentPage(items.meta.totalPages || 1);
      }
    }
  }, [items, currentPage]);

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <Input
          type="text"
          placeholder="Search..."
          className="w-64 lg:w-80"
          onChange={e => setSearchTerm(e.target.value)}
        />
        {allowCreate && (
          <Button
            onClick={() => handleOpenModal('create')}
            className="flex items-center gap-2 cursor-pointer"
          >
            <TbPlus className="size-4" />
            <span>Add</span>
          </Button>
        )}
      </div>

      <div className="overflow-auto rounded-2xl border border-gray-200 shadow-sm">
        <Table className="w-full text-sm">
          <TableHeader className="bg-gray-50">
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead
                    key={header.id}
                    onClick={
                      header.column.getCanSort()
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                    className={`px-4 py-3 text-left font-medium text-gray-700 ${
                      header.column.getCanSort()
                        ? 'cursor-pointer select-none hover:text-gray-900 transition-colors'
                        : ''
                    }`}
                  >
                    {header.isPlaceholder ? null : (
                      <div className="flex items-center gap-1">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanSort() && (
                          <>
                            {header.column.getIsSorted() === 'asc' ? (
                              <TbArrowUp size={16} />
                            ) : header.column.getIsSorted() === 'desc' ? (
                              <TbArrowDown size={16} />
                            ) : (
                              <TbArrowsSort size={16} className="opacity-40" />
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isItemsLoading || isItemsFetching ? (
              Array.from({ length: 10 }).map((_, rowIndex) => (
                <TableRow key={rowIndex} className="animate-pulse">
                  {table.getVisibleFlatColumns().map((col, colIndex) => (
                    <TableCell key={colIndex} className="px-4 py-2">
                      <Skeleton className="h-4 w-full rounded-md" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={table.getVisibleFlatColumns().length}
                  className="h-64 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <TbMoodSad size={36} className="text-gray-400" />
                    <p className="text-base font-medium">No results found</p>
                    <p className="text-sm text-gray-400">
                      Try adjusting your search or filter.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              <>
                {table.getRowModel().rows.map(row => (
                  <TableRow
                    key={row.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell
                        key={cell.id}
                        className="px-4 py-3"
                        style={{
                          width: cell.column.columnDef.size,
                          minWidth: cell.column.columnDef.size,
                          maxWidth: cell.column.columnDef.size,
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                {Array.from({
                  length: Math.max(0, 10 - table.getRowModel().rows.length),
                }).map((_, i) => (
                  <TableRow key={`empty-${i}`}>
                    {table.getVisibleFlatColumns().map((col, j) => (
                      <TableCell key={j} className="px-4 py-3">
                        <div className="h-6" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between mt-4">
        <PageSizeSelector
          value={limit}
          onChange={value => {
            setLimit(value);
            setcurrentPage(0);
          }}
        />

        <Pagination
          totalPages={items?.meta?.totalPages || 0}
          onPageChange={setcurrentPage}
          currentPage={currentPage}
        />
      </div>

      <CreateUpdateModal
        id={selectedId}
        entityName={entityName}
        isOpen={modalType === 'create' || modalType === 'update'}
        isUpdate={modalType === 'update'}
        onClose={handleCloseModal}
        FormComponent={FormComponent}
        onSuccess={handleCloseModal}
      />

      <RemoveConfirmModal
        isOpen={modalType === 'remove'}
        onConfirm={handleRemoveConfirm}
        onClose={handleCloseModal}
        isLoading={isRemoveLoading}
      />
    </>
  );
};

export default DataTable;
