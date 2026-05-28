import { useMutation, useQuery } from '@apollo/client/react';
import { trim } from 'lodash';
import { ChangeEvent, useEffect, useState } from 'react';

import RemovalReason from '@/components/pages/Campfire/CampfireTools/Moderations/RemovalReason';
import Rules, {
  RuleItem,
} from '@/components/pages/Campfire/CampfireTools/Moderations/Rules';
import Button from '@/components/Utility/Button';
import Modal from '@/components/Utility/Modal';
import Input from '@/elements/Input';
import Text from '@/elements/Text';
import TextArea from '@/elements/TextArea';
import { useAppSelector } from '@/Hooks/useRedux';
import {
  emitErrorNotification,
  emitNotification,
  formatGraphqlError,
  getWordCount,
  normalizeWhitespace,
} from '@/lib/helpers';
import {
  ADD_CAMPFIRE_RULES,
  ADD_REMOVAL_REASON,
  GET_CAMPFIRE_RULES,
  GET_REMOVAL_REASONS,
} from '@/service/graphql/Campfire';
import { getUserId } from '@/state/Slices/auth';
import { getUserToken } from '@/utils/verifyAuthentication';

interface ICampfireRulesRemoval {
  campfireId: string;
}

const RulesAndRemoval = ({ campfireId }: ICampfireRulesRemoval) => {
  const token = getUserToken();
  const userId = useAppSelector(getUserId);
  const [activeTab, setActiveTab] = useState('rules');
  const [ruleAddModal, setRuleAddModal] = useState(false);
  const [removalAddModal, setRemovalAddModal] = useState(false);
  const [ruleTitle, setRuleTitle] = useState('');
  const [ruleDescription, setRuleDescription] = useState('');
  const [rulesData, setRulesData] = useState<RuleItem[]>([]);
  const [removalTitle, setRemovalTitle] = useState('');
  const [removalDescription, setRemovalDescription] = useState('');
  const [removalData, setRemovalData] = useState([]);
  const [rearrangeTab, setRearrangeTab] = useState(false);

  const {
    loading: rulesQueryLoading,
    error: rulesQueryError,
    refetch: rulesQueryRefetch,
    data: rulesQueryData,
  } = useQuery(GET_CAMPFIRE_RULES, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    fetchPolicy: 'no-cache',
    variables: {
      campfireId: campfireId,
    },
    skip: token === '',
  });

  useEffect(() => {
    if ((rulesQueryData as any)?.campfire_rules) {
      setRulesData((rulesQueryData as any).campfire_rules);
      (rulesQueryData as any).campfire_rules &&
        (rulesQueryData as any).campfire_rules.length < 2 &&
        setRearrangeTab(false);
    }
  }, [rulesQueryData]);

  useEffect(() => {
    if (rulesQueryError) {
      emitErrorNotification(formatGraphqlError(rulesQueryError));
    }
  }, [rulesQueryError]);

  const [addCampfireRules] = useMutation(ADD_CAMPFIRE_RULES, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    onCompleted: () => {
      rulesQueryRefetch();
    },
    onError: () => {
      emitNotification('error', 'This rule already exists!');
    },
  });

  const {
    loading: removalQueryLoading,
    error: removalQueryError,
    refetch: removalQueryRefetch,
    data: removalQueryData,
  } = useQuery(GET_REMOVAL_REASONS, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    fetchPolicy: 'no-cache',
    variables: {
      campfireId,
    },
  });

  useEffect(() => {
    if ((removalQueryData as any)?.campfire_reasons_to_remove) {
      setRemovalData((removalQueryData as any).campfire_reasons_to_remove);
    }
  }, [removalQueryData]);

  useEffect(() => {
    if (removalQueryError) {
      emitErrorNotification(formatGraphqlError(removalQueryError));
    }
  }, [removalQueryError]);

  const [addRemovalReason] = useMutation(ADD_REMOVAL_REASON, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    onCompleted: () => {
      removalQueryRefetch();
    },
    onError: () => {
      emitNotification('error', 'This reason for removal already exists!');
    },
  });

  const handleRuleAddClick = () => {
    addCampfireRules({
      variables: {
        index: rulesData.length + 1,
        rule: normalizeWhitespace(ruleTitle),
        campfire_id: campfireId,
        user_id: userId,
        description: normalizeWhitespace(ruleDescription),
      },
    });
    setRuleAddModal(false);
    setRuleTitle('');
    setRuleDescription('');
  };

  const handleRemovalAddClick = () => {
    addRemovalReason({
      variables: {
        index: 1,
        reason: normalizeWhitespace(removalTitle),
        campfire_id: campfireId,
        user_id: userId,
        description: normalizeWhitespace(removalDescription),
      },
    });
    setRemovalAddModal(false);
    setRemovalTitle('');
    setRemovalDescription('');
  };

  const handleTitleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const rule = e.target.value;
    let input = trim(rule); // remove extra spaces at the end
    const words = input.split(/\s+/); // split the input by space to count words
    if (words.length > 50) {
      // limit to 50 words
      // input = words.slice(0, 50).join(' ');
      // setRuleTitle(input);
      return;
    } else {
      setRuleTitle(rule);
    }
  };

  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const description = e.target.value;
    let input = trim(description); // remove extra spaces at the end
    const words = input.split(/\s+/); // split the input by space to count words
    if (words.length > 500) {
      // limit to 500 words
      // input = words.slice(0, 500).join(' ');
      // setRuleDescription(input);
      return;
    } else {
      setRuleDescription(description);
    }
  };

  const handleRemovalTitleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const reason = e.target.value;
    let input = trim(reason); // remove extra spaces at the end
    const words = input.split(/\s+/); // split the input by space to count words
    if (words.length > 50) {
      // limit to 50 words
      // input = words.slice(0, 50).join(' ');
      // setRemovalTitle(input);
      return;
    } else {
      setRemovalTitle(reason);
    }
  };

  const handleRemovalDescriptionChange = (
    e: ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const description = e.target.value;
    let input = trim(description); // remove extra spaces at the end
    const words = input.split(/\s+/); // split the input by space to count words
    if (words.length > 500) {
      // limit to 500 words
      // input = words.slice(0, 500).join(' ');
      // setRemovalDescription(input);
      return;
    } else {
      setRemovalDescription(description);
    }
  };

  const handleRearrange = () => {
    setRearrangeTab(!rearrangeTab);
  };

  return (
    <div className="sm-container mx-auto p-4">
      <div className="mb-4 flex justify-between">
        <div className="flex space-x-4">
          <button
            className={`rounded px-4 py-2 ${activeTab === 'rules'
              ? 'rounded-full bg-gray-100 py-1 px-3 text-gray-1600 lg:py-2 lg:px-4'
              : 'text-skyBlue-200'
              }`}
            onClick={() => {
              setActiveTab('rules');
              setRearrangeTab(false);
            }}
          >
            Rules
          </button>
          <button
            className={`rounded px-4 py-2 ${activeTab === 'reasons'
              ? 'rounded-full bg-gray-100 py-1 px-3 text-gray-1600 lg:py-2 lg:px-4'
              : 'text-skyBlue-200'
              }`}
            onClick={() => setActiveTab('reasons')}
          >
            Reasons to Remove
          </button>
        </div>

        {activeTab === 'rules' ? (
          <div className="flex space-x-4">
            {rulesData.length > 1 && (
              <button
                className="rounded-full border border-blue-100 px-4 py-2 text-skyBlue-200"
                onClick={handleRearrange}
              >
                {rearrangeTab ? 'Done' : 'Rearrange'}
              </button>
            )}
            <button
              className="rounded-full border border-blue-100 bg-sky-400 px-4 py-2 text-white"
              onClick={() => {
                setRearrangeTab(false);
                setRuleAddModal(true);
              }}
            >
              Add
            </button>
          </div>
        ) : (
          <button
            className="rounded-full border border-blue-100 bg-sky-400 px-4 py-2 text-white"
            onClick={() => setRemovalAddModal(true)}
          >
            Add removal reason
          </button>
        )}
      </div>

      {activeTab === 'rules' && (
        <Rules
          rulesData={rulesData}
          setRulesData={setRulesData}
          loading={rulesQueryLoading}
          rulesQueryRefetch={rulesQueryRefetch}
          rearrangeTab={rearrangeTab}
          campfireId={campfireId}
        />
      )}
      {activeTab === 'reasons' && (
        <RemovalReason
          removalData={removalData}
          loading={removalQueryLoading}
          removalQueryRefetch={removalQueryRefetch}
        />
      )}

      {ruleAddModal && (
        <Modal
          id="AddRuleModal"
          isVisible={ruleAddModal}
          onClose={() => {
            setRuleAddModal(false);
            setRuleTitle('');
            setRuleDescription('');
          }}
        >
          {rulesData.length < 10 ? (
            <div>
              <Text font="font-semibold">Add rule</Text>

              <div>
                <div className="mb-2">
                  <Text color="text-black-200" font="font-normal">
                    Title
                  </Text>
                  <Input
                    autoFocus
                    type="text"
                    name="ruleTitle"
                    value={ruleTitle}
                    onChange={(
                      e: React.ChangeEvent<
                        HTMLInputElement | HTMLTextAreaElement
                      >,
                    ) => handleTitleChange(e)}
                  />
                  <p className="pt-1 text-xs text-gray-500 text-end">
                    * Max {getWordCount(ruleTitle)}/50 words
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
                    value={ruleDescription}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      handleDescriptionChange(e)
                    }
                  />
                  <p className="pt-1 text-xs text-gray-500 text-end">
                    * Max {getWordCount(ruleDescription)}/500 words
                  </p>
                </div>

                <div>
                  <Button
                    type="secondary"
                    block
                    isdisabled={!ruleTitle}
                    onClick={handleRuleAddClick}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <Text>Communities can have a maximum of 10 rules.</Text>
            </div>
          )}
        </Modal>
      )}

      {removalAddModal && (
        <Modal
          id="AddRemovalModal"
          isVisible={removalAddModal}
          onClose={() => {
            setRemovalAddModal(false);
            setRemovalTitle('');
            setRemovalDescription('');
          }}
        >
          <div>
            <Text font="font-semibold">Add removal reason</Text>
            <div>
              <div className="mb-2">
                <Text color="text-black-200" font="font-normal">
                  Title
                </Text>
                <Input
                  autoFocus
                  type="text"
                  name="removalTitle"
                  value={removalTitle}
                  onChange={(
                    e: React.ChangeEvent<
                      HTMLInputElement | HTMLTextAreaElement
                    >,
                  ) => handleRemovalTitleChange(e)}
                />
                <p className="pt-1 text-xs text-gray-500 text-end">
                  * Max {getWordCount(removalTitle)}/50 words
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
                  value={removalDescription}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    handleRemovalDescriptionChange(e)
                  }
                />
                <p className="pt-1 text-xs text-gray-500 text-end">
                  * Max {getWordCount(removalDescription)}/500 words
                </p>
              </div>

              <div>
                <Button
                  type="secondary"
                  block
                  isdisabled={!removalTitle}
                  onClick={handleRemovalAddClick}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default RulesAndRemoval;
