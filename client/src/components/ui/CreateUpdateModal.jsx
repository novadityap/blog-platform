'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/shadcn/dialog';
import { cn } from '@/lib/utils';

const CreateUpdateModal = ({
  id,
  isUpdate,
  isOpen,
  onClose,
  onSuccess,
  entityName,
  FormComponent,
}) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent
      className={cn(
        'overflow-hidden p-0',
        entityName === 'property' && isUpdate && 'md:max-w-4xl'
      )}
    >
      <DialogHeader className="px-6 pt-6">
        <DialogTitle>
          {isUpdate ? `Update ${entityName}` : `Create ${entityName}`}
        </DialogTitle>
        <DialogDescription className="sr-only"></DialogDescription>
      </DialogHeader>
      <div className="max-h-[80vh] overflow-y-auto px-6 pb-6">
        {FormComponent && (
          <FormComponent
            id={id}
            isUpdate={isUpdate}
            onSuccess={onSuccess}
            onClose={onClose}
          />
        )}
      </div>
    </DialogContent>
  </Dialog>
);

export default CreateUpdateModal;
