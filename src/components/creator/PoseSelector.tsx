import React from 'react';
import { HeadId, PoseId } from '../../lib/playys/types';
import { POSES } from '../../lib/playys/poses';
import { BlueHead } from '../playys/heads/BlueHead';
import { DreamyyHead } from '../playys/heads/DreamyyHead';
import { SparkyyHead } from '../playys/heads/SparkyyHead';
import { HeroPose } from '../playys/poses/HeroPose';
import { WavePose } from '../playys/poses/WavePose';
import { JumpPose } from '../playys/poses/JumpPose';
import { SittingPose } from '../playys/poses/SittingPose';
import { Check } from 'lucide-react';

interface PoseSelectorProps {
  selectedHead: HeadId;
  selectedPose: PoseId;
  onSelectPose: (pose: PoseId) => void;
}

export const PoseSelector: React.FC<PoseSelectorProps> = ({
  selectedHead,
  selectedPose,
  onSelectPose,
}) => {
  const renderMiniCharacterInPose = (poseId: PoseId) => {
    const headComponent = () => {
      switch (selectedHead) {
        case 'blue':
          return <BlueHead mode="color" x={300} y={320} scale={1} />;
        case 'dreamyy':
          return <DreamyyHead mode="color" x={300} y={320} scale={1} />;
        case 'sparkyy':
          return <SparkyyHead mode="color" x={300} y={320} scale={1} />;
        default:
          return <BlueHead mode="color" x={300} y={320} scale={1} />;
      }
    };

    const poseComponent = () => {
      switch (poseId) {
        case 'hero':
          return <HeroPose mode="color" symbol="star" x={300} y={450} scale={1} />;
        case 'wave':
          return <WavePose mode="color" symbol="star" x={300} y={450} scale={1} />;
        case 'jump':
          return <JumpPose mode="color" symbol="star" x={300} y={430} scale={1} />;
        case 'sitting':
          return <SittingPose mode="color" symbol="star" x={300} y={450} scale={1} />;
        default:
          return <HeroPose mode="color" symbol="star" x={300} y={450} scale={1} />;
      }
    };

    return (
      <svg viewBox="100 160 400 600" className="w-full h-full object-contain pointer-events-none">
        {poseComponent()}
        {headComponent()}
      </svg>
    );
  };

  return (
    <div id="step-2-pose" className="bg-white rounded-2xl p-4 shadow-sm border-2 border-amber-100">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-sm shadow-sm">
          2
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-800 leading-tight">Choose a Pose</h3>
          <p className="text-xs text-gray-700">How should your Playy stand?</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {POSES.map((pose) => {
          const isSelected = selectedPose === pose.id;
          return (
            <button
              key={pose.id}
              id={`pose-btn-${pose.id}`}
              type="button"
              onClick={() => onSelectPose(pose.id)}
              className={`relative flex flex-col items-center justify-between p-1.5 rounded-xl border-3 transition-all duration-200 cursor-pointer bg-slate-50 hover:bg-white hover:shadow-md ${
                isSelected
                  ? 'border-pink-500 bg-pink-50/50 shadow-md ring-2 ring-pink-300 scale-102'
                  : 'border-slate-200 hover:border-amber-300'
              }`}
            >
              {isSelected && (
                <div className="absolute -top-1.5 -right-1 w-4.5 h-4.5 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-sm">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}

              <div className="w-14 h-16 sm:w-16 sm:h-20 flex items-center justify-center overflow-hidden">
                {renderMiniCharacterInPose(pose.id)}
              </div>

              <span
                className={`text-[11px] font-bold mt-1 text-center truncate w-full ${
                  isSelected ? 'text-pink-600' : 'text-gray-700'
                }`}
              >
                {pose.tagline}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
