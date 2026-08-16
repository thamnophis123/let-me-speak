export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      analysis_versions: {
        Row: {
          created_at: string;
          id: string;
          project_id: string;
          published_at: string;
          summary: string;
          updated_at: string;
          version: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          project_id: string;
          published_at: string;
          summary: string;
          updated_at?: string;
          version: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          project_id?: string;
          published_at?: string;
          summary?: string;
          updated_at?: string;
          version?: string;
        };
        Relationships: [
          {
            foreignKeyName: "analysis_versions_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      claims: {
        Row: {
          claim: string;
          created_at: string;
          id: string;
          note: string;
          project_id: string;
          side: Database["public"]["Enums"]["claim_side"];
          sort_order: number;
          strength: Database["public"]["Enums"]["claim_strength"];
          updated_at: string;
        };
        Insert: {
          claim: string;
          created_at?: string;
          id?: string;
          note: string;
          project_id: string;
          side: Database["public"]["Enums"]["claim_side"];
          sort_order?: number;
          strength: Database["public"]["Enums"]["claim_strength"];
          updated_at?: string;
        };
        Update: {
          claim?: string;
          created_at?: string;
          id?: string;
          note?: string;
          project_id?: string;
          side?: Database["public"]["Enums"]["claim_side"];
          sort_order?: number;
          strength?: Database["public"]["Enums"]["claim_strength"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "claims_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      evidence_items: {
        Row: {
          created_at: string;
          file_path: string | null;
          file_url: string | null;
          id: string;
          project_id: string;
          sort_order: number;
          source: string;
          source_url: string | null;
          status: Database["public"]["Enums"]["evidence_status"];
          summary: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          file_path?: string | null;
          file_url?: string | null;
          id?: string;
          project_id: string;
          sort_order?: number;
          source: string;
          source_url?: string | null;
          status: Database["public"]["Enums"]["evidence_status"];
          summary: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          file_path?: string | null;
          file_url?: string | null;
          id?: string;
          project_id?: string;
          sort_order?: number;
          source?: string;
          source_url?: string | null;
          status?: Database["public"]["Enums"]["evidence_status"];
          summary?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "evidence_items_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      projects: {
        Row: {
          confidence: Database["public"]["Enums"]["confidence_level"] | null;
          confidence_note: string | null;
          created_at: string;
          decisive_factors: string[];
          id: string;
          jurisdiction: string;
          recommendation: string | null;
          slug: string;
          status: Database["public"]["Enums"]["project_status"];
          summary: string;
          title: string;
          uncertainties: string[];
          updated_at: string;
        };
        Insert: {
          confidence?: Database["public"]["Enums"]["confidence_level"] | null;
          confidence_note?: string | null;
          created_at?: string;
          decisive_factors?: string[];
          id?: string;
          jurisdiction: string;
          recommendation?: string | null;
          slug: string;
          status?: Database["public"]["Enums"]["project_status"];
          summary: string;
          title: string;
          uncertainties?: string[];
          updated_at?: string;
        };
        Update: {
          confidence?: Database["public"]["Enums"]["confidence_level"] | null;
          confidence_note?: string | null;
          created_at?: string;
          decisive_factors?: string[];
          id?: string;
          jurisdiction?: string;
          recommendation?: string | null;
          slug?: string;
          status?: Database["public"]["Enums"]["project_status"];
          summary?: string;
          title?: string;
          uncertainties?: string[];
          updated_at?: string;
        };
        Relationships: [];
      };
      submissions: {
        Row: {
          claim: string;
          contribution_type: Database["public"]["Enums"]["contribution_type"];
          created_at: string;
          explanation: string | null;
          id: string;
          project_id: string;
          role: Database["public"]["Enums"]["contributor_role"];
          status: Database["public"]["Enums"]["submission_status"];
          supporting_link: string | null;
          updated_at: string;
        };
        Insert: {
          claim: string;
          contribution_type: Database["public"]["Enums"]["contribution_type"];
          created_at?: string;
          explanation?: string | null;
          id?: string;
          project_id: string;
          role: Database["public"]["Enums"]["contributor_role"];
          status?: Database["public"]["Enums"]["submission_status"];
          supporting_link?: string | null;
          updated_at?: string;
        };
        Update: {
          claim?: string;
          contribution_type?: Database["public"]["Enums"]["contribution_type"];
          created_at?: string;
          explanation?: string | null;
          id?: string;
          project_id?: string;
          role?: Database["public"]["Enums"]["contributor_role"];
          status?: Database["public"]["Enums"]["submission_status"];
          supporting_link?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "submissions_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      claim_side: "for" | "against" | "examined";
      claim_strength:
        | "Strong"
        | "Moderate"
        | "Weak"
        | "Invalid"
        | "Not Applicable";
      confidence_level: "Low" | "Medium" | "High";
      contribution_type:
        | "New evidence"
        | "Correction of fact"
        | "Argument for"
        | "Argument against"
        | "Challenge to an existing claim"
        | "Question / missing information";
      contributor_role:
        | "Resident"
        | "Nearby landowner"
        | "Business owner"
        | "Subject-matter expert"
        | "Elected or appointed official"
        | "Other";
      evidence_status:
        | "Verified"
        | "Company Claim"
        | "Staff Estimate"
        | "Open Question";
      project_status:
        | "Open for Comment"
        | "Baseline"
        | "Final Recommendation";
      submission_status:
        | "pending_review"
        | "accepted"
        | "rejected"
        | "duplicate";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];
