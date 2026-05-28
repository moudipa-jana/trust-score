import { useMutation } from '@apollo/client/react';
import {
  DragDropContext,
  Draggable,
  DraggableProvided,
  Droppable,
  DroppableProvided,
  DropResult,
} from '@hello-pangea/dnd';
import { isEmpty, trim } from 'lodash';
import { useEffect, useState } from 'react';
import { RiAlarmWarningFill } from 'react-icons/ri';
import DeleteIcon from '/public/images/DeleteIcon.svg';
import Edit from '/public/images/Edit.svg';
import Info from '/public/images/Info.svg';
import Rearrange from '/public/images/Rearrange.svg';
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
  DELETE_AND_REARRANGE_RULES,
  DELETE_CAMPFIRE_RULES,
  EDIT_CAMPFIRE_RULES,
  UPDATE_INDEX_OF_RULE_BY_ID,
  UPDATE_INDEX_OF_RULES,
} from '@/service/graphql/Campfire';
import { getUserToken } from '@/utils/verifyAuthentication';
import { ProfileActivityErrorComponent } from '@/components/pages/Profile/ProfileActivities';

export interface RuleItem {
  id: string;
  rule: string;
  description?: string;
  index: number;
}

interface CampfireRulesProps {
  rulesData: RuleItem[];
  setRulesData: React.Dispatch<React.SetStateAction<RuleItem[]>>;
  loading: boolean;
  rulesQueryRefetch: () => void;
  rearrangeTab: boolean;
  campfireId: string;
}

const reorder = (
  list: RuleItem[],
  startIndex: number,
  endIndex: number,
): RuleItem[] => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

const Rules = ({
  rulesData,
  setRulesData,
  loading,
  rulesQueryRefetch,
  rearrangeTab,
  campfireId,
}: CampfireRulesProps) => {
  const token = getUserToken();
  const [editModal, setEditModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [currentRuleId, setCurrentRuleId] = useState<string | null>(null);
  const [currentRuleIndex, setCurrentRuleIndex] = useState<number | null>(null);
  const [currentRuleTitle, setCurrentRuleTitle] = useState<string>('');
  const [currentRuleDesc, setCurrentRuleDesc] = useState<string>('');

  const [editCampfireRules] = useMutation(EDIT_CAMPFIRE_RULES, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    fetchPolicy: 'no-cache',
    onCompleted: () => {
      setEditModal(false);
      rulesQueryRefetch();
    },
    onError: (err) => {
      emitErrorNotification(formatGraphqlError(err));
    },
  });

  const [deleteAndRearrangeRules] = useMutation(DELETE_AND_REARRANGE_RULES, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    fetchPolicy: 'no-cache',
    onCompleted: () => {
      rulesQueryRefetch();
    },
    onError: (err) => {
      emitErrorNotification(formatGraphqlError(err));
    },
  });

  const [deleteCampfireRules] = useMutation(DELETE_CAMPFIRE_RULES, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    fetchPolicy: 'no-cache',
    onCompleted: () => {
      setDeleteModal(false);
      deleteAndRearrangeRules({
        variables: {
          ruleId: currentRuleId,
          index: currentRuleIndex,
          campfireId,
        },
      });
    },
    onError: (err) => {
      emitErrorNotification(formatGraphqlError(err));
    },
  });

  const [updateIndexes] = useMutation(UPDATE_INDEX_OF_RULES, {
    context: { headers: { Authorization: `Bearer ${token}` } },
    onError: (err) => {
      emitErrorNotification(formatGraphqlError(err));
    },
  });

  const [updateIndexById] = useMutation(UPDATE_INDEX_OF_RULE_BY_ID, {
    context: { headers: { Authorization: `Bearer ${token}` } },
    onCompleted: () => {
      // rulesQueryRefetch();
    },
    onError: (err) => {
      emitErrorNotification(formatGraphqlError(err));
    },
  });

  const handleEditIconClick = (ruleId: string, ruleItem: RuleItem) => {
    setCurrentRuleId(ruleId);
    setCurrentRuleTitle(ruleItem?.rule || '');
    setCurrentRuleDesc(ruleItem?.description || '');
    setEditModal(true);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rule = e.target.value;
    let input = trim(rule); // remove extra spaces at the end
    const words = input.split(/\s+/); // split the input by space to count words
    if (words.length > 50) {
      // limit to 50 words
      // input = words.slice(0, 50).join(' ');
      // setCurrentRuleTitle(input);
      return;
    } else {
      setCurrentRuleTitle(rule);
    }
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const description = e.target.value;
    let input = trim(description); // remove extra spaces at the end
    const words = input.split(/\s+/); // split the input by space to count words
    if (words.length > 500) {
      // limit to 500 words
      // input = words.slice(0, 500).join(' ');
      // setCurrentRuleDesc(input);
      return;
    } else {
      setCurrentRuleDesc(description);
    }
  };

  const handleEdit = () => {
    if (currentRuleId) {
      editCampfireRules({
        variables: {
          id: currentRuleId,
          rule: normalizeWhitespace(currentRuleTitle),
          description: normalizeWhitespace(currentRuleDesc),
        },
      });
    }
  };

  const handleDetail = () => {
    setDetailModal(false);
    setEditModal(true);
  };

  const handleRemove = () => {
    if (currentRuleId) {
      deleteCampfireRules({
        variables: {
          id: currentRuleId,
        },
      });
    }
  };

  const handleCancel = () => {
    setDeleteModal(false);
  };

  const handleDetailIconClick = (ruleId: string, ruleItem: RuleItem) => {
    setCurrentRuleId(ruleId);
    setCurrentRuleTitle(ruleItem?.rule || '');
    setCurrentRuleDesc(ruleItem?.description || '');
    setDetailModal(true);
  };

  const handleDeleteClick = (rule: RuleItem) => {
    setCurrentRuleIndex(rule.index);
    setCurrentRuleId(rule.id);
    setDeleteModal(true);
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) {
      return;
    }
    const oldIndex = result.source.index + 1;
    const newIndex = result.destination.index + 1;

    try {
      const items = reorder(
        rulesData,
        result.source.index,
        result.destination.index,
      );
      setRulesData([...items]);
      const mutationPromises = [];
      if (newIndex > oldIndex) {
        for (let i = oldIndex; i <= newIndex; i++) {
          mutationPromises.push(
            updateIndexes({
              variables: {
                index: i,
                newIndex: i - 1,
                campfire_id: campfireId,
              },
            }),
          );
        }
      } else {
        for (let i = oldIndex; i >= newIndex; i--) {
          mutationPromises.push(
            updateIndexes({
              variables: {
                index: i,
                newIndex: i + 1,
                campfire_id: campfireId,
              },
            }),
          );
        }
      }
      const results = await Promise.all(mutationPromises);
      const failed = results.some(
        (res) => !(res?.data as any)?.update_campfire_rules,
      );
      if (failed) {
        emitErrorNotification('One or more rules were not updated!');
        return;
      }
      // Final update for the moved rule itself
      await updateIndexById({
        variables: { ruleId: result.draggableId, newIndex },
      });
    } catch (err) {
      emitErrorNotification(formatGraphqlError(err));
    }
  };

  return (
    <div>
      <div>
        <Text color="text-gray-700" size="base">
          These are rules that visitors must follow to participate. They can be
          used as reasons to report or ban posts, comments, and users.
          Communities can have a maximum of 10 rules.
        </Text>
      </div>

      {loading ? (
        <div
          className="mt-20 mb-20 flex items-center justify-center"
          style={{ minHeight: 300 }}
        >
          <TabletLoader style={{ height: 150 }} />
        </div>
      ) : isEmpty(rulesData) ? (
        <div className="layout flex flex-col items-center justify-center gap-3 text-center">
          <ProfileActivityErrorComponent errorMessage="Oops something went wrong" />
          <p className="text-sm font-bold text-gray-500">Nothing to see here</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided: DroppableProvided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="py-2"
              >
                {rulesData.map((rule: RuleItem, index: number) =>
                  rearrangeTab ? (
                    <Draggable
                      key={rule.id}
                      draggableId={rule.id}
                      index={index}
                    >
                      {(childProvided: DraggableProvided) => (
                        <div
                          ref={childProvided.innerRef}
                          {...childProvided.draggableProps}
                          {...childProvided.dragHandleProps}
                          key={rule.id}
                          className="flex items-center justify-between border-b border-gray-300 p-3"
                        >
                          <div className="max-w-2xl truncate overflow-ellipsis whitespace-nowrap text-left">
                            {rule.rule}
                          </div>
                          <div className="flex gap-2">
                            <div
                              className="mr-1 h-4 w-4 cursor-pointer"
                              onClick={() => handleDeleteClick(rule)}
                            >
                              <CustomImage src={DeleteIcon} alt="delete" />
                            </div>
                            <div
                              className="mr-1 h-4 w-4 cursor-pointer"
                              onClick={() =>
                                handleDetailIconClick(rule.id, rule)
                              }
                            >
                              <CustomImage src={Rearrange} alt="rearrange" />
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ) : (
                    <div
                      key={rule.id}
                      className="flex items-center justify-between border-b border-gray-300 p-3"
                    >
                      <div className="max-w-2xl truncate overflow-ellipsis whitespace-nowrap text-left">
                        {rule.rule}
                      </div>
                      <div className="flex gap-2">
                        <div
                          className="mr-1 h-4 w-4 cursor-pointer"
                          onClick={() => handleEditIconClick(rule.id, rule)}
                        >
                          <CustomImage src={Edit} alt="edit" />
                        </div>
                        <div
                          className="mr-1 h-4 w-4 cursor-pointer"
                          onClick={() => handleDetailIconClick(rule.id, rule)}
                        >
                          <CustomImage src={Info} alt="info" />
                        </div>
                      </div>
                    </div>
                  ),
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {editModal && (
        <Modal
          id="EditModal"
          isVisible={editModal}
          onClose={() => setEditModal(false)}
        >
          <div>
            <Text font="font-semibold">Edit rule</Text>
            <div>
              <div className="mb-2">
                <Text color="text-black-200" font="font-normal">
                  Title
                </Text>
                <Input
                  autoFocus
                  type="text"
                  name="ruleTitle"
                  value={currentRuleTitle}
                  onChange={
                    handleTitleChange as (
                      e: React.ChangeEvent<
                        HTMLInputElement | HTMLTextAreaElement
                      >,
                    ) => void
                  }
                />
                <p className="pt-1 text-xs text-gray-500 text-end">
                  * Max {getWordCount(currentRuleTitle)}/50 words
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
                  value={currentRuleDesc}
                  onChange={handleDescriptionChange}
                />
                <p className="pt-1 text-xs text-gray-500 text-end">
                  * Max {getWordCount(currentRuleDesc)}/500 words
                </p>
              </div>

              <div>
                <Button
                  type="secondary"
                  block
                  isdisabled={!currentRuleTitle}
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
                  name="ruleTitle"
                  value={currentRuleTitle}
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
                <TextArea value={currentRuleDesc} />
              </div>

              <div>
                <Button
                  type="secondary"
                  block
                  isdisabled={!currentRuleTitle}
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
              <Text font="font-semibold">Do you want to delete this rule?</Text>
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

export default Rules;
