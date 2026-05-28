import Action from '/public/images/tools/Action.svg';
import Content from '/public/images/tools/Content.svg';
import Details from '/public/images/tools/Details.svg';
import Help from '/public/images/tools/Help.svg';
import Insights from '/public/images/tools/Insights.svg';
import Posts from '/public/images/tools/Posts.svg';
import Privacy from '/public/images/tools/Privacy.svg';
import Rules from '/public/images/tools/Rules.svg';
import Setting from '/public/images/tools/Setting.svg';
import User from '/public/images/tools/User.svg';

export const actionsList = [
  { value: 'Admin', label: 'Admin' },
  { value: 'Remove', label: 'Remove' },
  { value: 'Block', label: 'Block' },
];

export const actionAdminList = [
  { value: 'Member', label: 'Member' },
  { value: 'Remove', label: 'Remove' },
  { value: 'Block', label: 'Block' },
];

export const CAMPFIRE_TOOLS_CATEGORIES = [
  {
    name: 'Overview',
    items: [
      { name: 'Details about posts', icon: Details },
      { name: 'User management', icon: User },
      { name: 'Insights', icon: Insights },
    ],
  },
  {
    name: 'Moderations',
    items: [
      { name: 'Rules and removal', icon: Rules },
      { name: 'Content controls', icon: Content },
      { name: 'Action log', icon: Action },
      { name: 'Privacy & Security', icon: Privacy },
    ],
  },
  {
    name: 'Settings',
    items: [
      { name: 'General settings', icon: Setting },
      { name: 'Posts and comments', icon: Posts },
    ],
  },
  {
    items: [{ name: 'Help', icon: Help }],
  },
];
