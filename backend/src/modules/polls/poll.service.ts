import { Poll, IPoll } from '../../models/Poll';
import { User } from '../../models/User';
import { AppError } from '../../utils/AppError';
import logger from '../../utils/logger';
import { Types } from 'mongoose';

interface CreatePollInput {
  question: string;
  options: { text: string }[];
  expiryDate: Date;
  isMultipleChoice?: boolean;
}

interface VoteInput {
  optionIndex: number;
}

export class PollService {
  static async createPoll(
    input: CreatePollInput,
    userId: string
  ): Promise<IPoll> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      if (user.role !== 'admin') {
        throw new AppError('Only admins can create polls', 403);
      }

      const poll = await Poll.create({
        question: input.question,
        options: input.options.map(opt => ({
          text: opt.text,
          votes: []
        })),
        expiryDate: input.expiryDate,
        isMultipleChoice: input.isMultipleChoice || false,
        createdBy: userId,
        society: user.society,
        isActive: true
      });

      await poll.populate('createdBy', 'name email');

      logger.info(`Poll created: ${poll.question} by ${userId}`);
      return poll;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Create poll error:', error);
      throw new AppError('Failed to create poll', 500);
    }
  }

  static async getPolls(
    page: number = 1,
    limit: number = 10,
    isActive?: boolean,
    search?: string
  ): Promise<{ polls: IPoll[]; total: number }> {
    try {
      const query: any = {};

      if (isActive !== undefined) {
        query.isActive = isActive;
      }

      if (search) {
        query.question = { $regex: search, $options: 'i' };
      }

      const skip = (page - 1) * limit;

      const [polls, total] = await Promise.all([
        Poll.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('createdBy', 'name email')
          .select('-options.votes'),
        Poll.countDocuments(query)
      ]);

      return { polls, total };
    } catch (error) {
      logger.error('Get polls error:', error);
      throw new AppError('Failed to get polls', 500);
    }
  }

  static async getPollById(id: string, userId?: string): Promise<IPoll> {
    try {
      const poll = await Poll.findById(id)
        .populate('createdBy', 'name email');

      if (!poll) {
        throw new AppError('Poll not found', 404);
      }

      // If user is authenticated, check if they've voted
      if (userId) {
        const hasVoted = poll.options.some(option =>
          option.votes.some(v => v.toString() === userId)
        );
        return { ...poll.toObject(), hasVoted } as any;
      }

      return poll;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Get poll error:', error);
      throw new AppError('Failed to get poll', 500);
    }
  }

  static async voteOnPoll(
    id: string,
    userId: string,
    input: VoteInput
  ): Promise<IPoll> {
    try {
      const poll = await Poll.findById(id);
      if (!poll) {
        throw new AppError('Poll not found', 404);
      }

      // Check if poll is active
      if (!poll.isActive) {
        throw new AppError('Poll is no longer active', 400);
      }

      // Check if poll has expired
      if (new Date(poll.expiryDate) < new Date()) {
        poll.isActive = false;
        await poll.save();
        throw new AppError('Poll has expired', 400);
      }

      // Check if option exists
      if (input.optionIndex < 0 || input.optionIndex >= poll.options.length) {
        throw new AppError('Invalid option', 400);
      }

      // Check if user has already voted
      let hasVoted = false;
      for (const option of poll.options) {
        if (option.votes.some(v => v.toString() === userId)) {
          hasVoted = true;
          break;
        }
      }

      if (hasVoted) {
        throw new AppError('You have already voted in this poll', 400);
      }

      // Add vote
      poll.options[input.optionIndex].votes.push(new Types.ObjectId(userId));
      await poll.save();

      // Update total votes
      const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes.length, 0);

      logger.info(`Vote recorded for poll ${id} by user ${userId}`);
      return poll;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Vote error:', error);
      throw new AppError('Failed to vote on poll', 500);
    }
  }

  static async getPollResults(id: string): Promise<any> {
    try {
      const poll = await Poll.findById(id)
        .populate('createdBy', 'name email');

      if (!poll) {
        throw new AppError('Poll not found', 404);
      }

      const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes.length, 0);

      const results = poll.options.map((option, index) => ({
        index,
        text: option.text,
        votes: option.votes.length,
        percentage: totalVotes > 0 ? (option.votes.length / totalVotes) * 100 : 0
      }));

      return {
        question: poll.question,
        totalVotes,
        isMultipleChoice: poll.isMultipleChoice,
        expiryDate: poll.expiryDate,
        isActive: poll.isActive,
        results,
        createdBy: poll.createdBy,
        createdAt: poll.createdAt
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Get poll results error:', error);
      throw new AppError('Failed to get poll results', 500);
    }
  }

  static async updatePoll(
    id: string,
    input: any,
    userId: string
  ): Promise<IPoll> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      if (user.role !== 'admin') {
        throw new AppError('Only admins can update polls', 403);
      }

      const poll = await Poll.findById(id);
      if (!poll) {
        throw new AppError('Poll not found', 404);
      }

      // Don't allow updating if poll has votes
      const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes.length, 0);
      if (totalVotes > 0) {
        throw new AppError('Cannot update poll after votes have been cast', 400);
      }

      if (input.question) poll.question = input.question;
      if (input.expiryDate) poll.expiryDate = input.expiryDate;
      if (input.isActive !== undefined) poll.isActive = input.isActive;

      await poll.save();
      await poll.populate('createdBy', 'name email');

      logger.info(`Poll updated: ${id} by ${userId}`);
      return poll;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Update poll error:', error);
      throw new AppError('Failed to update poll', 500);
    }
  }

  static async deletePoll(id: string, userId: string): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      if (user.role !== 'admin') {
        throw new AppError('Only admins can delete polls', 403);
      }

      const poll = await Poll.findById(id);
      if (!poll) {
        throw new AppError('Poll not found', 404);
      }

      await poll.deleteOne();
      logger.info(`Poll deleted: ${id} by ${userId}`);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Delete poll error:', error);
      throw new AppError('Failed to delete poll', 500);
    }
  }
}