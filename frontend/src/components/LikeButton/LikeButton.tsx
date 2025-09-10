import { useEffect, useState } from 'react';
import { useNotification } from '../../hooks/useNotification';

import {
  likeEducation,
  unlikeEducation,
  getLikedEducationIds,
  likeAction,
  unlikeAction,
  getLikedActionIds,
} from '../../services/likeService';

interface LikeButtonProps {
  educationId?: number;
  actionId?: number;
  initialLiked?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const LikeButton: React.FC<LikeButtonProps> = ({
  educationId,
  actionId,
  initialLiked = false,
  onClick,
}) => {
  const targetId = actionId || educationId;
  const isAction = Boolean(actionId);

  const [liked, setLiked] = useState(initialLiked);
  const [loading, setLoading] = useState(false);

  const { warning, error: notifyError } = useNotification();

  const token = localStorage.getItem('accessToken');


  useEffect(() => {
    const fetchLikeStatus = async () => {
      if (!token) {
        setLiked(false);
        return;
      }
      try {
        const likedIds = isAction
          ? await getLikedActionIds()
          : await getLikedEducationIds();
        setLiked(targetId !== undefined && likedIds.includes(targetId));
      } catch (error) {
        console.error('Failed to obtain the collection status', error);
        notifyError('Failed to obtain the collection status');
      }
    };

    if (targetId) {
      fetchLikeStatus();
    }
  }, [targetId, isAction, token, notifyError]);

  const handleToggle = async () => {
    if (!token) {
      warning('Please log in first before you can add to your favorites!❤️');
      return;
    }

    if (loading || !targetId) return;
    setLoading(true);

    try {
      if (liked) {
        isAction ? await unlikeAction(targetId) : await unlikeEducation(targetId);
      } else {
        isAction ? await likeAction(targetId) : await likeEducation(targetId);
      }
      setLiked(!liked);
    } catch (error) {
      console.error('Collection operation failed', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onClick?.(e);
        handleToggle();
      }}
      disabled={loading}
      className="text-xl focus:outline-none"
      aria-label={liked ? 'Remove from favorites' : 'favorites'}
    >
      {liked ? '❤️' : '🤍'}
    </button>
  );
};

export default LikeButton;