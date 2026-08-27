export interface User {
  id: string
  email: string
  username: string
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  token_type: string
  user: User
}

export type KnowledgeLevel = 'NEW' | 'FAMILIAR' | 'LEARNING' | 'INTERMEDIATE' | 'STRONG'

export type ProcessingStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

export type RelationshipType = 'RELATED_TO' | 'DEPENDS_ON' | 'PART_OF' | 'USES' | 'LEADS_TO'

export type PathItemStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'

export interface Tag {
  id: string
  user_id: string
  name: string
  created_at: string
}

export interface Concept {
  id: string
  user_id: string
  name: string
  description?: string | null
  knowledge_level: KnowledgeLevel
  created_at: string
  updated_at: string
}

export interface RelatedConcept {
  id: string
  name: string
  relationship_type: RelationshipType
  direction: 'outgoing' | 'incoming'
  knowledge_level: KnowledgeLevel
}

export interface RelatedNote {
  id: string
  title: string
  summary?: string | null
  created_at: string
}

export interface ConceptDetail extends Concept {
  related_concepts: RelatedConcept[]
  related_notes: RelatedNote[]
  tags: string[]
}

export interface Note {
  id: string
  user_id: string
  title: string
  content: string
  summary?: string | null
  source?: string | null
  processing_status: ProcessingStatus
  created_at: string
  updated_at: string
  tags: Tag[]
  concepts: Concept[]
}

export interface GraphNode {
  id: string
  name: string
  knowledge_level: KnowledgeLevel
  notes_count: number
  connections_count: number
}

export interface GraphEdge {
  id: string
  source: string
  target: string
  relationship_type: RelationshipType
  weight: number
}

export interface GraphResponse {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

export interface LearningPathItem {
  id: string
  learning_path_id: string
  concept_id: string
  position: number
  status: PathItemStatus
  concept?: Concept | null
}

export interface LearningPath {
  id: string
  user_id: string
  title: string
  description?: string | null
  created_at: string
  updated_at: string
  total_items: number
  completed_items: number
  items: LearningPathItem[]
}

export interface GeneratedPathStep {
  title: string
  description: string
  concept_name: string
}

export interface GeneratedLearningPathResponse {
  title: string
  description: string
  steps: GeneratedPathStep[]
}

export interface ConceptLevelCount {
  level: KnowledgeLevel
  count: number
}

export interface GrowthDataPoint {
  date: string
  notes_count: number
  concepts_count: number
}

export interface PathProgressSummary {
  id: string
  title: string
  total_items: number
  completed_items: number
  progress_percentage: number
}

export interface RecentKnowledgeItem {
  id: string
  type: 'note' | 'concept'
  title: string
  timestamp: string
  badge?: string | null
}

export interface ProgressMetrics {
  total_notes: number
  total_concepts: number
  total_tags: number
  total_connections: number
  total_learning_paths: number
  completed_concepts: number
  learning_concepts: number
  concepts_by_level: ConceptLevelCount[]
  learning_paths_progress: PathProgressSummary[]
  growth_timeline: GrowthDataPoint[]
  recent_knowledge: RecentKnowledgeItem[]
}

export interface SourceReference {
  id: string
  title: string
  type: 'note' | 'concept'
  excerpt?: string | null
}

export interface SearchResultItem {
  id: string
  title: string
  excerpt: string
  source?: string | null
  similarity: number
  created_at: string
  tags: Tag[]
  concepts: Concept[]
}

export interface AskKnowledgeResponse {
  answer: string
  sources: SourceReference[]
  confidence: 'high' | 'medium' | 'insufficient_knowledge'
}

export interface TutorMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface TutorChatResponse {
  response: string
  suggested_actions: string[]
  sources: SourceReference[]
  related_concepts: string[]
}

export interface SummarizeResponse {
  title: string
  summary: string
  key_concepts: string[]
  important_points: string[]
  practical_example?: string | null
  related_concepts: string[]
  things_to_learn_next: string[]
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  error?: {
    code: string
    message: string
    details?: any
  }
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  total_pages: number
}
