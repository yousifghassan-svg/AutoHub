import { Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { WizardChrome } from '@/features/sell/components/WizardChrome';
import { StepCategory } from '@/features/sell/components/steps/StepCategory';
import { StepDescription } from '@/features/sell/components/steps/StepDescription';
import { StepLocation } from '@/features/sell/components/steps/StepLocation';
import { StepMedia } from '@/features/sell/components/steps/StepMedia';
import { StepPreview } from '@/features/sell/components/steps/StepPreview';
import { StepPrice } from '@/features/sell/components/steps/StepPrice';
import { StepSubmit } from '@/features/sell/components/steps/StepSubmit';
import { StepVehicleDetails } from '@/features/sell/components/steps/StepVehicleDetails';
import { StepVehicleType } from '@/features/sell/components/steps/StepVehicleType';
import { WizardProvider, useWizard } from '@/features/sell/context/WizardProvider';

function WizardBody() {
  const { draft, dispatch, submit, submitting } = useWizard();

  const onClose = () => {
    router.replace('/sell');
  };

  const onNext = async () => {
    if (draft.step === 'preview') {
      dispatch({ type: 'NEXT' });
      return;
    }
    if (draft.step === 'submit') {
      try {
        await submit();
        Alert.alert('Submitted', 'Your listing was sent for review.', [
          { text: 'OK', onPress: () => router.replace('/(tabs)') },
        ]);
      } catch (e) {
        Alert.alert('Submit failed', e instanceof Error ? e.message : 'Try again');
      }
      return;
    }
    dispatch({ type: 'NEXT' });
  };

  const nextLabel =
    draft.step === 'preview'
      ? 'Review & submit'
      : draft.step === 'submit'
        ? draft.status === 'pending'
          ? 'Done'
          : 'Submit for review'
        : 'Continue';

  return (
    <WizardChrome
      onClose={onClose}
      onNext={() => {
        if (draft.step === 'submit' && draft.status === 'pending') {
          router.replace('/(tabs)');
          return;
        }
        void onNext();
      }}
      nextLabel={nextLabel}
      nextLoading={submitting}
      showBack={draft.step !== 'submit' || draft.status !== 'pending'}
    >
      {draft.step === 'category' ? <StepCategory /> : null}
      {draft.step === 'vehicleType' ? <StepVehicleType /> : null}
      {draft.step === 'vehicleDetails' ? <StepVehicleDetails /> : null}
      {draft.step === 'media' ? <StepMedia /> : null}
      {draft.step === 'location' ? <StepLocation /> : null}
      {draft.step === 'price' ? <StepPrice /> : null}
      {draft.step === 'description' ? <StepDescription /> : null}
      {draft.step === 'preview' ? <StepPreview /> : null}
      {draft.step === 'submit' ? <StepSubmit /> : null}
    </WizardChrome>
  );
}

export default function SellWizardScreen() {
  const { localId } = useLocalSearchParams<{ localId?: string }>();
  return (
    <WizardProvider initialLocalId={typeof localId === 'string' ? localId : undefined}>
      <WizardBody />
    </WizardProvider>
  );
}
