"use client";

import { Card, Switch, Select, Divider, Tag } from 'antd';
import { 
  Award, 
  Share, 
  Shield, 
  Bell, 
  Blocks, 
  BookOpen, 
  Target,
  Zap
} from 'lucide-react';
import { SiEthereum } from 'react-icons/si';
import toast from 'react-hot-toast';

interface CredentialSettingsProps {
  settings: any;
  blockchain: any;
  learning: any;
  onUpdate: (updates: any) => Promise<void>;
}

export default function CredentialSettings({ 
  settings, 
  blockchain, 
  learning, 
  onUpdate 
}: CredentialSettingsProps) {
  
  const handleCredentialChange = async (field: string, value: any) => {
    try {
      await onUpdate({
        credentials: {
          ...settings,
          [field]: value
        }
      });
    } catch (error) {
      toast.error('Failed to update credential setting');
    }
  };

  const handleBlockchainChange = async (field: string, value: any) => {
    try {
      await onUpdate({
        blockchain: {
          ...blockchain,
          [field]: value
        }
      });
    } catch (error) {
      toast.error('Failed to update blockchain setting');
    }
  };

  const handleLearningChange = async (field: string, value: any) => {
    try {
      await onUpdate({
        learning: {
          ...learning,
          [field]: value
        }
      });
    } catch (error) {
      toast.error('Failed to update learning setting');
    }
  };

  const sharingLevelOptions = [
    { value: 'public', label: 'Public', description: 'Anyone can view' },
    { value: 'link-only', label: 'Link Only', description: 'Only those with link' },
    { value: 'private', label: 'Private', description: 'Only you can view' }
  ];

  const networkOptions = [
    { value: 'none', label: 'Disabled', description: 'No blockchain storage' },
    { value: 'ethereum', label: 'Ethereum', description: 'Main Ethereum network' },
    { value: 'polygon', label: 'Polygon', description: 'Polygon (MATIC) network' },
    { value: 'bsc', label: 'BSC', description: 'Binance Smart Chain' }
  ];

  const gasFeeOptions = [
    { value: 'low', label: 'Low', description: 'Cheaper, slower transactions' },
    { value: 'medium', label: 'Medium', description: 'Balanced speed and cost' },
    { value: 'high', label: 'High', description: 'Faster, more expensive' }
  ];

  const difficultyOptions = [
    { value: 'beginner', label: 'Beginner', description: 'Just getting started' },
    { value: 'intermediate', label: 'Intermediate', description: 'Some experience' },
    { value: 'advanced', label: 'Advanced', description: 'Experienced learner' },
    { value: 'mixed', label: 'Mixed', description: 'Variety of levels' }
  ];

  const learningStyleOptions = [
    { value: 'visual', label: 'Visual', description: 'Learn through images and diagrams' },
    { value: 'auditory', label: 'Auditory', description: 'Learn through listening' },
    { value: 'kinesthetic', label: 'Kinesthetic', description: 'Learn through practice' },
    { value: 'mixed', label: 'Mixed', description: 'Combination of styles' }
  ];

  return (
    <div className="space-y-6">
      {/* Credential Verification */}
      <Card title={
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5" />
          <span>Credential Verification</span>
        </div>
      }>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Auto-Verification</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Automatically verify credentials when possible
              </p>
            </div>
            <Switch
              checked={settings?.autoVerificationEnabled !== false}
              onChange={(value) => handleCredentialChange('autoVerificationEnabled', value)}
            />
          </div>

          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Manual Approval Required</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Require manual review before displaying credentials
              </p>
            </div>
            <Switch
              checked={settings?.requireManualApproval === true}
              onChange={(value) => handleCredentialChange('requireManualApproval', value)}
            />
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <div>
                <h4 className="font-medium">Expiration Reminders</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get notified before credentials expire
                </p>
              </div>
            </div>
            <Switch
              checked={settings?.expirationReminders !== false}
              onChange={(value) => handleCredentialChange('expirationReminders', value)}
            />
          </div>
        </div>
      </Card>

      {/* Credential Sharing */}
      <Card title={
        <div className="flex items-center gap-2">
          <Share className="w-5 h-5" />
          <span>Credential Sharing</span>
        </div>
      }>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Allow Credential Sharing</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enable sharing credentials with others
              </p>
            </div>
            <Switch
              checked={settings?.allowCredentialSharing !== false}
              onChange={(value) => handleCredentialChange('allowCredentialSharing', value)}
            />
          </div>

          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Default Sharing Level</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Default privacy level for new credentials
              </p>
            </div>
            <Select
              value={settings?.defaultSharingLevel || 'public'}
              onChange={(value) => handleCredentialChange('defaultSharingLevel', value)}
              style={{ width: 150 }}
              options={sharingLevelOptions}
            />
          </div>
        </div>
      </Card>

      {/* Blockchain Integration */}
      <Card title={
        <div className="flex items-center gap-2">
          <SiEthereum className="w-5 h-5" />
          <span>Blockchain Integration</span>
          <Tag color="blue">Web3</Tag>
        </div>
      }>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Blockchain Storage</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Store credentials on blockchain for immutable verification
              </p>
            </div>
            <Switch
              checked={settings?.blockchainStorage === true}
              onChange={(value) => handleCredentialChange('blockchainStorage', value)}
            />
          </div>

          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Preferred Network</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Choose blockchain network for credential storage
              </p>
            </div>
            <Select
              value={blockchain?.preferredNetwork || 'none'}
              onChange={(value) => handleBlockchainChange('preferredNetwork', value)}
              style={{ width: 150 }}
              options={networkOptions}
            />
          </div>

          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Auto-Mint NFT Credentials</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Automatically create NFTs for verified credentials
              </p>
            </div>
            <Switch
              checked={blockchain?.autoMintNFTCredentials === true}
              onChange={(value) => handleBlockchainChange('autoMintNFTCredentials', value)}
              disabled={blockchain?.preferredNetwork === 'none'}
            />
          </div>

          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Gas Fee Preference</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Choose transaction speed vs cost preference
              </p>
            </div>
            <Select
              value={blockchain?.gasFeePreference || 'medium'}
              onChange={(value) => handleBlockchainChange('gasFeePreference', value)}
              style={{ width: 150 }}
              options={gasFeeOptions}
              disabled={blockchain?.preferredNetwork === 'none'}
            />
          </div>
        </div>
      </Card>

      {/* Learning Preferences */}
      <Card title={
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          <span>Learning Preferences</span>
        </div>
      }>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Skill Tracking</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Track your skill development and progress
              </p>
            </div>
            <Switch
              checked={learning?.skillTrackingEnabled !== false}
              onChange={(value) => handleLearningChange('skillTrackingEnabled', value)}
            />
          </div>

          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Show Learning Path</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Display personalized learning recommendations
              </p>
            </div>
            <Switch
              checked={learning?.showLearningPath !== false}
              onChange={(value) => handleLearningChange('showLearningPath', value)}
            />
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <div>
                <h4 className="font-medium">Goal Reminders</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get reminders about your learning goals
                </p>
              </div>
            </div>
            <Switch
              checked={learning?.goalReminders !== false}
              onChange={(value) => handleLearningChange('goalReminders', value)}
            />
          </div>

          <Divider />

          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Difficulty Preference</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Preferred difficulty level for learning content
              </p>
            </div>
            <Select
              value={learning?.difficultyPreference || 'mixed'}
              onChange={(value) => handleLearningChange('difficultyPreference', value)}
              style={{ width: 150 }}
              options={difficultyOptions}
            />
          </div>

          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Learning Style</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your preferred way of learning new concepts
              </p>
            </div>
            <Select
              value={learning?.preferredLearningStyle || 'mixed'}
              onChange={(value) => handleLearningChange('preferredLearningStyle', value)}
              style={{ width: 150 }}
              options={learningStyleOptions}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}