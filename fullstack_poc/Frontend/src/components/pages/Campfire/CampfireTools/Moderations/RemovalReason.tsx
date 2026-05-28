import { useMutation } from '@apollo/client/react';
import { isEmpty, trim } from 'lodash';
import { useState } from 'react';
import { RiAlarmWarningFill } from 'react-icons/ri';

import DeleteIcon from '/public/images/DeleteIcon.svg';
import Edit from '/public/images/Edit.svg';
import Info from '/public/images/Info.svg';
import Button from '@/components/Utility/Button';
import CustomImage from '@/components/Utility/CustomImage';
import TabletLoader from '@/components/Utility/LogoLoader/TabletLoader';
import Modal from '@/components/Utility/Modal';
import Input from '@/elements/Input';
import Text from '@/elements/Text';
import TextArea from '@/elements/TextArea';
import {
  emitErrorNotification,
  formatGraphqlError,
  getWordCount,
  normalizeWhitespace,
} from '@/lib/helpers';
import {
  DELETE_REMOVAL_REASON,
  EDIT_REMOVAL_REASON,
} from '@/service/graphql/Campfire';
import { getUserToken } from '@/utils/verifyAuthentication';
import { ProfileActivityErrorComponent } from '@/components/pages/Profile/ProfileActivities';

interface RemovalReasonItem {
  id: string;
  reason: string;
  description?: string;
}

interface RemovalReasonProps {
  removalData: RemovalReasonItem[];
  loading: boolean;
  removalQueryRefetch: () => void;
}

interface EditRemovalResponse {
  data: {
    update_removal_reasons_by_pk: RemovalReasonItem;
  };
}

interface DeleteRemovalResponse {
  data: {
    delete_removal_reasons_by_pk: RemovalReasonItem;
  };
}

const RemovalReason = ({
  removalData,
  loading,
  removalQueryRefetch,
}: RemovalReasonProps) => {
  const token = getUserToken();
  const [editModal, setEditModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [currentRemovalId, setCurrentRemovalId] = useState<string | null>(null);
  const [currentRemovalTitle, setCurrentRemovalTitle] = useState<string>('');
  const [currentRemovalDesc, setCurrentRemovalDesc] = useState<string>('');

  const [editRemovalReason] = useMutation<EditRemovalResponse>(
    EDIT_REMOVAL_REASON,
    {
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      fetchPolicy: 'no-cache',
      onCompleted: () => {
        setEditModal(false);
        removalQueryRefetch();
      },
      onError: (err) => {
        emitErrorNotification(formatGraphqlError(err));
      },
    },
  );

  const [deleteRemovalReason] = useMutation<DeleteRemovalResponse>(
    DELETE_REMOVAL_REASON,
    {
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      fetchPolicy: 'no-cache',
      onCompleted: () => {
        setDeleteModal(false);
        removalQueryRefetch();
      },
      onError: (err) => {
        emitErrorNotification(formatGraphqlError(err));
      },
    },
  );

  const handleEdit = () => {
    if (currentRemovalId) {
      editRemovalReason({
        variables: {
          id: currentRemovalId,
          reason: normalizeWhitespace(currentRemovalTitle),
          description: normalizeWhitespace(currentRemovalDesc),
        },
      });
    }
  };

  const handleDetail = () => {
    setDetailModal(false);
    setEditModal(true);
  };

  const handleRemove = () => {
    if (currentRemovalId) {
      deleteRemovalReason({
        variables: {
          id: currentRemovalId,
        },
      });
    }
  };

  const handleCancel = () => {
    setDeleteModal(false);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const reason = e.target.value;
    let input = trim(reason);
    const words = input.split(/\s+/);
    if (words.length > 50) {
      // input = words.slice(0, 50).join(' ');
      // setCurrentRemovalTitle(input);
      return;
    } else {
      setCurrentRemovalTitle(reason);
    }
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const description = e.target.value;
    let input = trim(description);
    const words = input.split(/\s+/);
    if (words.length > 500) {
      // input = words.slice(0, 500).join(' ');
      // setCurrentRemovalDesc(input);
      return;
    } else {
      setCurrentRemovalDesc(description);
    }
  };

  const handleEditIconClick = (
    removalId: string,
    removalItem: RemovalReasonItem,
  ) => {
    setCurrentRemovalId(removalId);
    setCurrentRemovalTitle(removalItem?.reason || '');
    setCurrentRemovalDesc(removalItem?.description || '');
    setEditModal(true);
  };

  const handleDetailIconClick = (
    removalId: string,
    removalItem: RemovalReasonItem,
  ) => {
    setCurrentRemovalId(removalId);
    setCurrentRemovalTitle(removalItem?.reason || '');
    setCurrentRemovalDesc(removalItem?.description || '');
    setDetailModal(true);
  };

  const handleDeleteIconClick = (removalId: string) => {
    setCurrentRemovalId(removalId);
    setDeleteModal(true);
  };

  return (
    <div>
      <div>
        <Text color="text-gray-700" size="base">
          Help people become better posters by giving a short reason why their
          post was removed.
        </Text>
      </div>

      {loading ? (
        <div
          className="mt-20 mb-20 flex items-center justify-center"
          style={{ minHeight: 300 }}
        >
          <TabletLoader style={{ height: 150 }} />
        </div>
      ) : isEmpty(removalData) ? (
        <div className="layout flex flex-col items-center justify-center gap-3 text-center">
          <ProfileActivityErrorComponent errorMessage="Oops something went wrong" />
          <p className="text-sm font-bold text-gray-500">Nothing to see here</p>
        </div>
      ) : (
        <div className="py-2">
          {removalData.map((reason: RemovalReasonItem) => (
            <div
              key={reason.id}
              className="flex items-center justify-between border-b border-gray-300  p-3"
            >
              <div className="max-w-2xl truncate overflow-ellipsis whitespace-nowrap text-left">
                {reason.reason}
              </div>
              <div className="flex gap-1">
                <div
                  className="mr-1 h-4 w-4 cursor-pointer"
                  onClick={() => handleDeleteIconClick(reason.id)}
                >
                  <CustomImage src={DeleteIcon} alt="delete" />
                </div>
                <div
                  className="mr-1 h-4 w-4 cursor-pointer"
                  onClick={() => handleEditIconClick(reason.id, reason)}
                >
                  <CustomImage src={Edit} alt="edit" />
                </div>
                <div
                  className="mr-1 h-4 w-4 cursor-pointer"
                  onClick={() => handleDetailIconClick(reason.id, reason)}
                >
                  <CustomImage src={Info} alt="info" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editModal && (
        <Modal
          id="EditModal"
          isVisible={editModal}
          onClose={() => setEditModal(false)}
        >
          <div>
            <Text font="font-semibold">Edit reason</Text>
            <div>
              <div className="mb-2">
                <Text color="text-black-200" font="font-normal">
                  Title
                </Text>
                <Input
                  autoFocus
                  type="text"
                  name="removalTitle"
                  value={currentRemovalTitle}
                  onChange={
                    handleTitleChange as (
                      e: React.ChangeEvent<
                        HTMLInputElement | HTMLTextAreaElement
                      >,
                    ) => void
                  }
                />
                <p className="pt-1 text-xs text-gray-500 text-right">
                  * Max {getWordCount(currentRemovalTitle)}/50 words
                </p>
              </div>

              <div className="mb-5">
                <div className=" flex items-center pb-1">
                  <Text color="text-black-200" font="font-normal">
                    Description
                  </Text>
                  <div className="ml-1">
                    <Text font="font-normal" color="text-gray-950">
                      {' '}
                      (Optional)
                    </Text>
                  </div>
                </div>
                <TextArea
                  value={currentRemovalDesc}
                  onChange={handleDescriptionChange}
                />
                <p className="pt-1 text-xs text-gray-500 text-end">
                  * Max {getWordCount(currentRemovalDesc)}/500 words
                </p>
              </div>

              <div>
                <Button
                  type="secondary"
                  block
                  isdisabled={!currentRemovalTitle}
                  onClick={handleEdit}
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {detailModal && (
        <Modal
          id="DetailModal"
          isVisible={detailModal}
          onClose={() => setDetailModal(false)}
        >
          <div>
            <Text font="font-semibold">Details</Text>
            <div>
              <div className="mb-2">
                <Text color="text-black-200" font="font-normal">
                  Title
                </Text>
                <Input
                  type="text"
                  name="removalTitle"
                  value={currentRemovalTitle}
                  disabled
                />
              </div>

              <div className="mb-5">
                <div className=" flex items-center pb-1">
                  <Text color="text-black-200" font="font-normal">
                    Description
                  </Text>
                  <div className="ml-1">
                    <Text font="font-normal" color="text-gray-950">
                      {' '}
                      (Optional)
                    </Text>
                  </div>
                </div>
                <TextArea value={currentRemovalDesc} />
                <p className="pt-1 text-xs text-gray-500 text-end">
                  * Max {getWordCount(currentRemovalDesc)}/500 words
                </p>
              </div>

              <div>
                <Button
                  type="secondary"
                  block
                  isdisabled={!currentRemovalTitle}
                  onClick={handleDetail}
                >
                  Edit
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {deleteModal && (
        <Modal
          id="DeleteModal"
          isVisible={deleteModal}
          onClose={() => setDeleteModal(false)}
        >
          <div>
            <div className="mb-5 flex h-full items-center justify-center">
              <Text font="font-semibold">
                Do you want to delete this reason?
              </Text>
            </div>
            <div>
              <div className="flex flex-row gap-4">
                <Button type="secondary" block onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="primary" block onClick={handleRemove}>
                  Remove
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default RemovalReason;
