import { sql } from 'drizzle-orm';
import { 
  index, 
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';
import { 
  users, artists, artworks, exhibitions, news, events, members, 
  memberActivities, culturalExchangePrograms, culturalExchangeParticipants,
  calligraphyAnalyses, learningProgress, auditLogs, fileStorage, 
  notifications, performanceMetrics
} from './schema';

// User 인덱스
export const userEmailIndex = uniqueIndex('user_email_idx').on(users.email);
export const userRoleIndex = index('user_role_idx').on(users.role);
export const userCreatedAtIndex = index('user_created_at_idx').on(users.createdAt);

// Artist 인덱스
export const artistUserIdIndex = index('artist_user_id_idx').on(artists.userId);
export const artistActiveIndex = index('artist_active_idx').on(artists.isActive);
export const artistNationalityIndex = index('artist_nationality_idx').on(artists.nationality);

// Artwork 인덱스
export const artworkArtistIdIndex = index('artwork_artist_id_idx').on(artworks.artistId);
export const artworkCategoryIndex = index('artwork_category_idx').on(artworks.category);
export const artworkForSaleIndex = index('artwork_for_sale_idx').on(artworks.isForSale);
export const artworkFeaturedIndex = index('artwork_featured_idx').on(artworks.isFeatured);
export const artworkYearIndex = index('artwork_year_idx').on(artworks.year);
export const artworkCreatedAtIndex = index('artwork_created_at_idx').on(artworks.createdAt);

// Exhibition 인덱스
export const exhibitionTypeIndex = index('exhibition_type_idx').on(exhibitions.type);
export const exhibitionStatusIndex = index('exhibition_status_idx').on(exhibitions.status);
export const exhibitionStartDateIndex = index('exhibition_start_date_idx').on(exhibitions.startDate);
export const exhibitionEndDateIndex = index('exhibition_end_date_idx').on(exhibitions.endDate);
export const exhibitionFeaturedIndex = index('exhibition_featured_idx').on(exhibitions.isFeatured);

// News 인덱스
export const newsCategoryIndex = index('news_category_idx').on(news.category);
export const newsStatusIndex = index('news_status_idx').on(news.status);
export const newsAuthorIdIndex = index('news_author_id_idx').on(news.authorId);
export const newsPublishedAtIndex = index('news_published_at_idx').on(news.publishedAt);
export const newsPinnedIndex = index('news_pinned_idx').on(news.isPinned);

// Event 인덱스
export const eventTypeIndex = index('event_type_idx').on(events.type);
export const eventStatusIndex = index('event_status_idx').on(events.status);
export const eventStartDateIndex = index('event_start_date_idx').on(events.startDate);
export const eventFeaturedIndex = index('event_featured_idx').on(events.isFeatured);
export const eventOrganizerIndex = index('event_organizer_idx').on(events.organizerId);

// Member 인덱스
export const memberUserIdIndex = uniqueIndex('member_user_id_idx').on(members.userId);
export const memberNumberIndex = uniqueIndex('member_number_idx').on(members.membershipNumber);
export const memberTierLevelIndex = index('member_tier_level_idx').on(members.tierLevel);
export const memberStatusIndex = index('member_status_idx').on(members.status);
export const memberNationalityIndex = index('member_nationality_idx').on(members.nationality);
export const memberJoinDateIndex = index('member_join_date_idx').on(members.joinDate);
export const memberLastActivityIndex = index('member_last_activity_idx').on(members.lastActivityDate);

// Member Activity 인덱스
export const memberActivityMemberIdIndex = index('member_activity_member_id_idx').on(memberActivities.memberId);
export const memberActivityTypeIndex = index('member_activity_type_idx').on(memberActivities.activityType);
export const memberActivityTimestampIndex = index('member_activity_timestamp_idx').on(memberActivities.timestamp);
export const memberActivityEntityIndex = index('member_activity_entity_idx').on(memberActivities.relatedEntityType, memberActivities.relatedEntityId);

// Cultural Exchange Program 인덱스
export const culturalProgramTypeIndex = index('cultural_program_type_idx').on(culturalExchangePrograms.programType);
export const culturalProgramStatusIndex = index('cultural_program_status_idx').on(culturalExchangePrograms.status);
export const culturalProgramStartDateIndex = index('cultural_program_start_date_idx').on(culturalExchangePrograms.startDate);
export const culturalProgramDeadlineIndex = index('cultural_program_deadline_idx').on(culturalExchangePrograms.applicationDeadline);
export const culturalProgramFeaturedIndex = index('cultural_program_featured_idx').on(culturalExchangePrograms.isFeatured);

// Cultural Exchange Participant 인덱스
export const culturalParticipantProgramIdIndex = index('cultural_participant_program_id_idx').on(culturalExchangeParticipants.programId);
export const culturalParticipantMemberIdIndex = index('cultural_participant_member_id_idx').on(culturalExchangeParticipants.memberId);
export const culturalParticipantStatusIndex = index('cultural_participant_status_idx').on(culturalExchangeParticipants.status);
export const culturalParticipantPaymentIndex = index('cultural_participant_payment_idx').on(culturalExchangeParticipants.paymentStatus);
export const culturalParticipantAppliedAtIndex = index('cultural_participant_applied_at_idx').on(culturalExchangeParticipants.appliedAt);

// Calligraphy Analysis 인덱스
export const analysisUserIdIndex = index('analysis_user_id_idx').on(calligraphyAnalyses.userId);
export const analysisMemberIdIndex = index('analysis_member_id_idx').on(calligraphyAnalyses.memberId);
export const analysisStyleIndex = index('analysis_style_idx').on(calligraphyAnalyses.calligraphyStyle);
export const analysisStatusIndex = index('analysis_status_idx').on(calligraphyAnalyses.status);
export const analysisScoreIndex = index('analysis_score_idx').on(calligraphyAnalyses.overallScore);
export const analysisCreatedAtIndex = index('analysis_created_at_idx').on(calligraphyAnalyses.createdAt);

// Learning Progress 인덱스
export const learningProgressMemberIdIndex = index('learning_progress_member_id_idx').on(learningProgress.memberId);
export const learningProgressCategoryIndex = index('learning_progress_category_idx').on(learningProgress.skillCategory);
export const learningProgressLevelIndex = index('learning_progress_level_idx').on(learningProgress.currentLevel);
export const learningProgressLastPracticeIndex = index('learning_progress_last_practice_idx').on(learningProgress.lastPracticeDate);

// Audit Log 인덱스
export const auditLogUserIdIndex = index('audit_log_user_id_idx').on(auditLogs.userId);
export const auditLogActionIndex = index('audit_log_action_idx').on(auditLogs.action);
export const auditLogResourceIndex = index('audit_log_resource_idx').on(auditLogs.resource);
export const auditLogTimestampIndex = index('audit_log_timestamp_idx').on(auditLogs.timestamp);
export const auditLogSeverityIndex = index('audit_log_severity_idx').on(auditLogs.severity);

// File Storage 인덱스
export const fileStorageUserIdIndex = index('file_storage_user_id_idx').on(fileStorage.userId);
export const fileStorageTypeIndex = index('file_storage_type_idx').on(fileStorage.fileType);
export const fileStoragePurposeIndex = index('file_storage_purpose_idx').on(fileStorage.purpose);
export const fileStorageEntityIndex = index('file_storage_entity_idx').on(fileStorage.relatedEntityType, fileStorage.relatedEntityId);
export const fileStorageStatusIndex = index('file_storage_status_idx').on(fileStorage.processingStatus);
export const fileStoragePublicIndex = index('file_storage_public_idx').on(fileStorage.isPublic);

// Notification 인덱스
export const notificationUserIdIndex = index('notification_user_id_idx').on(notifications.userId);
export const notificationTypeIndex = index('notification_type_idx').on(notifications.type);
export const notificationReadIndex = index('notification_read_idx').on(notifications.isRead);
export const notificationPriorityIndex = index('notification_priority_idx').on(notifications.priority);
export const notificationCreatedAtIndex = index('notification_created_at_idx').on(notifications.createdAt);

// Performance Metrics 인덱스
export const performanceMetricTypeIndex = index('performance_metric_type_idx').on(performanceMetrics.metricType);
export const performanceMetricEndpointIndex = index('performance_metric_endpoint_idx').on(performanceMetrics.endpoint);
export const performanceMetricTimestampIndex = index('performance_metric_timestamp_idx').on(performanceMetrics.timestamp);
export const performanceMetricUserIdIndex = index('performance_metric_user_id_idx').on(performanceMetrics.userId);

// 복합 인덱스
export const artworkArtistCategoryIndex = index('artwork_artist_category_idx').on(artworks.artistId, artworks.category);
export const memberTierStatusIndex = index('member_tier_status_idx').on(members.tierLevel, members.status);
export const analysisUserStyleIndex = index('analysis_user_style_idx').on(calligraphyAnalyses.userId, calligraphyAnalyses.calligraphyStyle);
export const activityMemberTypeIndex = index('activity_member_type_idx').on(memberActivities.memberId, memberActivities.activityType);
export const notificationUserReadIndex = index('notification_user_read_idx').on(notifications.userId, notifications.isRead);