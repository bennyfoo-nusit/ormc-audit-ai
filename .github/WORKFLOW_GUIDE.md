# AI-Assisted SDLC Workflow Guide

## Overview
This guide provides step-by-step instructions for using the AI-assisted SDLC framework from tech stack validation through deployment.

## Workflow Phases

### Phase 1: Tech Stack Validation (Prototyping)
**Duration:** 1-3 days  
**Participants:** Tech Lead, Engineer  
**Agent:** Technical Feasibility

#### Steps
1. **Initialize Prototype**
   ```
   @2-technical-feasibility init
   ```

   Provide:
   - Project name and high-level description
   - Proposed tech stack (frontend, backend, database, infrastructure)
   - Target platform (web, mobile, desktop, API-only)
   - Key capabilities to validate (1–3 riskiest features)
   - Known constraints (cloud provider, compliance, team skills)

2. **Run Capability Spikes**
   ```
   @2-technical-feasibility spike {capability-name}
   ```
   Repeat for each high-risk capability identified.

3. **Check Integration Feasibility**
   ```
   @2-technical-feasibility check-integrations
   ```

4. **Run Baseline Benchmarks**
   ```
   @2-technical-feasibility benchmark
   ```

5. **Generate Tech Stack Decision**
   ```
   @2-technical-feasibility decide
   ```

**Gate:** Proceed only when:
- ✅ Prototype scaffold builds and runs
- ✅ All high-risk capability spikes completed
- ✅ Integration points verified
- ✅ Benchmarks meet acceptable thresholds
- ✅ Go/no-go recommendation accepted by Tech Lead

**Output:**
- ✅ Runnable project scaffold in `/prototype/scaffold/`
- ✅ Spike results in `/prototype/spikes/`
- ✅ Tech stack ADR in `/docs/prototype/tech-stack-decision.md`
- ✅ Integration report in `/docs/prototype/integration-check.md`
- ✅ Benchmark baselines in `/docs/prototype/baseline-benchmarks.md`

---

### Phase 2: Project Setup
**Duration:** 15-30 minutes  
**Participants:** Engineer, DevOps  
**Agent:** Connectivity Setup Agent  
**📖 See:** [Credential Setup Guide](./CREDENTIAL_SETUP.md)

#### Steps
1. **Clone Reusable Framework**
   ```bash
   git clone https://github.com/your-org/nusit-ai-sdlc.git my-new-project
   cd my-new-project
   rm -rf .git
   git init
   git add .
   git commit -m "Initial commit from AI-SDLC framework"
   ```

2. **Setup Personal Access Tokens**
   
   **⚠️ First Time? Follow the [Credential Setup Guide](./CREDENTIAL_SETUP.md)**
   
   Create `.env` file:
   ```bash
   # Copy template
   cp .env.example .env
   
   # Edit and add your tokens
   # See CREDENTIAL_SETUP.md for detailed instructions on:
   # - Creating GitHub PAT (https://github.com/settings/tokens)
   # - Creating Azure DevOps PAT
   # - Creating Confluence API tokens
   ```

3. **Initialize Connections**
   ```
   @connectivity-agent setup
   ```
   
   Provide:
   - GitHub repository URL
   - Azure DevOps organization and project
   - Confluence space URL

4. **Verify Connections**
   ```
   @connectivity-agent validate
   ```

**Output:**
- ✅ All integrations configured in `/docs/integrations/`
- ✅ Connection validation passed
- ✅ Ready for requirement discovery/analysis

---

### Phase 3: Business Discovery
**Duration:** 2-4 hours  
**Participants:** Business Analyst, Functional Team, Product Owner  
**Agent:** Requirement Discovery Agent

#### Steps
1. **Start High-Level Discovery**
   ```
   @requirement-discovery start discovery
   ```

2. **Capture the Business Need in Plain Language**
   Work with the agent to document:
   - problem statement
   - business outcome
   - stakeholders and users
   - scope / out of scope
   - current-state pain points
   - future-state intent
   - business rules, constraints, assumptions, and open questions

3. **Review Discovery Artifacts**
   Check files created in:
   - `/requirements/discovery/`

4. **Confirm Discovery Readiness**
   Proceed when the discovery package is sufficient to draft the first-cut requirement document.

**Output:**
- ✅ High-level discovery markdown artifact in `/requirements/discovery/`
- ✅ High-level discovery JSON artifact in `/requirements/discovery/`
- ✅ Key assumptions and open questions captured
- ✅ Ready for first-cut requirement drafting

---

### Phase 4: First-Cut Draft Requirements
**Duration:** 2-4 hours  
**Participants:** Business Analyst, Functional Team, Product Owner  
**Agent:** Requirement Architect Agent

#### Steps
1. **Draft First-Cut Requirements from Discovery**
   ```
   @requirement-architect architect requirements
   ```

2. **Review Generated Draft Artifacts**
   Check files created in:
   - `/requirements/architect/`

3. **Review the Draft in Confluence**
   - Publish or copy the draft into the appropriate Confluence page
   - Review with BA and functional stakeholders
   - Correct major omissions or misunderstandings

4. **Capture Remaining Gaps**
   - Confirm open questions are explicit
   - Decide whether more discovery is needed before downstream decomposition

**Gate:** Proceed only when:
- ✅ First-cut draft requirement document created
- ✅ BA/stakeholders have reviewed the draft in Confluence
- ✅ Major gaps are visible and acceptable for downstream decomposition

**Output:**
- ✅ First-cut draft requirement markdown in `/requirements/architect/`
- ✅ First-cut draft requirement JSON in `/requirements/architect/`
- ✅ Consolidated open questions log in `/requirements/architect/`
- ✅ Reviewed Confluence draft ready for downstream analysis

---

### Phase 5: Detailed Requirements Gathering & Design Analysis
**Duration:** 1-3 days  
**Participants:** Functional Team, Product Owner, Engineer  
**Agents:** Requirements Analysis Agent, Screen Design Agent

#### Steps
1. **Functional Team Creates Technical Design Using the Reviewed Confluence Draft as the Source of Truth**
   - Ensure the reviewed first-cut draft is available in Confluence
   - Revise and expand first-cut draft into comprehensive specs in Confluence
   - Include functional requirements
   - Document non-functional requirements
   - Add screen designs/wireframes

2. **Analyze Detailed Requirements**
   ```
   @3-requirement-analyst analyze https://company.atlassian.net/wiki/spaces/PROJ/pages/123456
   ```

3. **Analyze Screen Designs**
   ```
   @screen-design-agent analyze https://company.atlassian.net/wiki/spaces/PROJ/pages/789012
   ```
   Or if designs are local:
   ```
   @screen-design-agent analyze /docs/designs/mockup.png
   ```

4. **Review Generated Documentation**
   Check files created in:
   - `/docs/requirements/functional/`
   - `/docs/requirements/non-functional/`
   - `/docs/requirements/screens/`
   - `/docs/requirements/clarifications/`

**Output:**
- ✅ Detailed requirements in AI-readable format
- ✅ Screen components cataloged
- ✅ Assets identified
- ✅ Clarification questions generated

---

### Phase 6: Clarification Resolution
**Duration:** 3-7 days  
**Participants:** Product Owner, Functional Team, Tech Lead, Engineer  
**Agent:** Requirements Analysis Agent (clarification commands)

#### Steps
1. **Initialize Clarification Tracking**
   ```
   @3-requirement-analyst clr-init
   ```

2. **Review Priority Clarifications**
   Open `/docs/requirements/clarifications/clarification-tracker.md`
   - Review Critical (P0) items
   - Review High (P1) items
   - Assign to stakeholders

3. **Schedule Clarification Sessions**
   ```
   @3-requirement-analyst clr-schedule
   ```
   - Agent generates agenda
   - Schedule meetings with stakeholders
   - Conduct clarification sessions

4. **Document Resolutions**
   For each resolved clarification:
   ```
   @3-requirement-analyst clr-resolve CLR-001
   ```
   Agent updates:
   - Clarification status
   - Related requirements
   - Impact assessment

5. **Generate Readiness Report**
   ```
   @3-requirement-analyst clr-report
   ```

**Gate:** Proceed only when:
- ✅ 100% Critical clarifications resolved
- ✅ 90%+ High priority clarifications resolved
- ✅ Acceptable assumptions documented for remaining items

---

### Phase 7: Development Planning
**Duration:** 1-2 days  
**Participants:** Tech Lead, Architect, Product Owner  
**Agent:** Development Project Planning

#### Steps
1. **Create Development Plan**
   ```
   @4-project-planning create-plan
   ```

2. **Review Generated Plan**
   Open `/docs/planning/development-plan.md`
   - Review task breakdown
   - Validate effort estimates
   - Confirm sprint assignments
   - Review risk register

3. **Adjust as Needed**
   - Refine task sequencing
   - Adjust estimates based on team feedback
   - Re-run if significant changes:
     ```
     @4-project-planning create-plan --revise
     ```

4. **Approve Development Plan**
   - Tech Lead sign-off
   - Product Owner agreement on priorities
   - Team capacity validation

**Output:**
- ✅ Complete development plan
- ✅ Tasks with estimates
- ✅ Sprint assignments
- ✅ Dependency map
- ✅ Risk mitigation strategies

---

### Phase 8: Work Item Creation
**Duration:** 2-4 hours  
**Participants:** Product Owner, Engineer  
**Agent:** Product Owner

#### Steps
1. **Create Iterations/Sprints in Azure DevOps**
   ```
   @5-product-owner setup-iterations
   ```

2. **Create User Stories and Tasks**
   ```
   @5-product-owner create-stories
   ```
   
   Agent creates:
   - User stories in Azure DevOps
   - Child tasks for each story
   - Links to requirements
   - Effort estimates
   - Sprint assignments

3. **Create GitHub Issues**
   Agent automatically creates corresponding GitHub issues for:
   - Each development task
   - Optimized for Copilot assignment
   - Linked to Azure DevOps work items

4. **Review and Refine**
   - Verify work items in Azure DevOps
   - Confirm GitHub issues created
   - Adjust sprint assignments if needed

**Output:**
- ✅ User stories in Azure DevOps
- ✅ Tasks with estimates and assignments
- ✅ GitHub issues for Copilot
- ✅ All items linked to requirements
- ✅ Sprints configured

---

### Phase 9: Development
**Duration:** Varies by project  
**Participants:** Developers, GitHub Copilot  
**Agents:** None (GitHub Copilot handles code generation)

#### Steps
1. **Assign Tasks**
   
   **For AI Development:**
   ```bash
   # Assign GitHub issue to Copilot
   # Via GitHub UI or API
   ```
   
   **For Human Development:**
   - Developer picks task from sprint backlog
   - Updates Azure DevOps task to "In Progress"

2. **Copilot Generates Code**
   - Copilot reads issue description
   - Generates code following coding standards
   - Creates unit tests (TDD approach)
   - Creates mocks for external interfaces
   - Creates Pull Request

3. **Monitor Progress**
   - Track PR creation
   - Monitor build status
   - Check test results

**Output:**
- ✅ Implementation code
- ✅ Unit tests (80%+ coverage)
- ✅ Integration tests
- ✅ Mocks for external interfaces
- ✅ Pull Request created

---

### Phase 10: Code Review
**Duration:** 1-2 days per PR  
**Participants:** Code Review Agent, Engineer  
**Agent:** Code Review Agent

#### Steps
1. **Automated Review**
   When PR is created, run:
   ```
   @code-review-agent review #42
   ```
   
   Or configure automatic review on PR creation

2. **Review Agent Feedback**
   Agent checks:
   - Coding standards compliance
   - Security vulnerabilities
   - Test coverage (≥80%)
   - Performance issues
   - Mock implementations
   - Documentation

3. **Agent Posts Review**
   - Inline comments on issues
   - Overall review summary
   - Quality score
   - Approval or change requests

4. **Human Engineer Review**
   - Review agent's findings
   - Verify critical issues
   - Add human judgment
   - Request changes or approve

5. **Address Feedback**
   - Developer (or Copilot) addresses issues
   - Re-request review
   - Iterate until approved

**Gate:** Merge only when:
- ✅ Code review agent approved
- ✅ Human engineer approved
- ✅ All tests passing
- ✅ Test coverage ≥ 80%
- ✅ No critical/high security issues

---

### Phase 11: Documentation
**Duration:** 1-2 days  
**Participants:** Engineer, Operations Team  
**Agent:** Documentation Agent

#### Steps
1. **Generate Setup Guide**
   ```
   @docs-agent create-setup-guide
   ```

2. **Generate Deployment Guide**
   ```
   @docs-agent create-deployment-guide
   ```

3. **Generate API Documentation**
   ```
   @docs-agent create-api-docs
   ```

4. **Generate Troubleshooting Guide**
   ```
   @docs-agent create-troubleshooting-guide
   ```

5. **Review and Enhance**
   - Review generated documentation
   - Add project-specific details
   - Test instructions on clean machine
   - Update with feedback

**Output:**
- ✅ Setup instructions
- ✅ Deployment procedures
- ✅ API documentation
- ✅ Troubleshooting guide
- ✅ Runbooks for operations

---

## Continuous Workflow

### Sprint Cycle (2 weeks typical)

**Sprint Planning (Day 1)**
- Review sprint backlog
- Assign tasks to developers/Copilot
- Clarify any questions

**Daily Development (Days 2-9)**
- Copilot generates code → PR created
- Code review agent reviews → Feedback
- Developer addresses → Merge
- Repeat for next task

**Testing & Stabilization (Days 10-12)**
- Integration testing
- Bug fixes
- Documentation updates

**Sprint Review & Retrospective (Day 13-14)**
- Demo completed features
- Retrospective on process
- Plan next sprint

---

## Agent Invocation Quick Reference

| Phase | Agent | Command |
|-------|-------|---------|
| Setup | Connectivity | `@connectivity-agent setup` |
| Discovery | Requirement Discovery | `@requirement-discovery start discovery` |
| Drafting | Requirement Architect | `@requirement-architect architect requirements` |
| Requirements | Requirements Analysis | `@3-requirement-analyst analyze {url}` |
| Requirements | Screen Design | `@screen-design-agent analyze {url or path}` |
| Clarifications | Requirements Analysis | `@3-requirement-analyst clr-init` |
| Clarifications | Requirements Analysis | `@3-requirement-analyst clr-resolve {CLR-ID}` |
| Planning | Development Planning | `@4-project-planning create-plan` |
| Work Items | Product Owner | `@5-product-owner create-stories` |
| Review | Code Review | `@code-review-agent review #{PR}` |
| Documentation | Documentation | `@docs-agent create-setup-guide` |

---

## Success Metrics

### Quality Metrics
- Requirements clarity: > 90% complete before development
- Clarification resolution: 100% Critical, 90% High resolved
- Test coverage: ≥ 80% for all new code
- Code review quality: Grade B or higher (≥80/100)
- Documentation completeness: 100% operational docs present

### Velocity Metrics
- Requirements to development ready: < 2 weeks
- Average PR review time: < 2 days
- Sprint completion rate: > 80% of committed story points
- Deployment frequency: Per sprint minimum

### Process Metrics
- Agent accuracy: > 95% correct analysis
- Human intervention needed: < 10% of tasks
- Rework due to requirements issues: < 5%
- Time saved vs. manual process: > 50%

---

## Troubleshooting

### Agent Not Responding
1. Check agent is properly configured in `.github/agents/`
2. Verify Copilot access in VS Code
3. Ensure workspace context loaded
4. Try rephrasing command

### Integration Failures
1. Run `@connectivity-agent validate`
2. Check environment variables set
3. Verify token permissions
4. Check network connectivity

### Low Quality Output
1. Provide more context in source documents
2. Resolve clarifications before proceeding
3. Give feedback to agent for refinement
4. Human review and augment where needed

---

## Best Practices

### For Functional Teams
- ✅ Be as specific as possible in requirements
- ✅ Include examples and edge cases
- ✅ Provide screen designs early
- ✅ Respond promptly to clarifications

### For Engineers
- ✅ Review agent output, don't blindly accept
- ✅ Provide feedback to improve agent performance
- ✅ Use agents as assistants, not replacements
- ✅ Maintain human oversight on critical decisions

### For Product Owners
- ✅ Prioritize clarification resolution
- ✅ Review requirements generated by agents
- ✅ Approve development plans before sprint start
- ✅ Participate in sprint reviews

---

## Continuous Improvement

### Monthly Review
- Analyze agent accuracy and usefulness
- Identify pain points in workflow
- Update agent prompts/skills
- Share learnings across teams

### Framework Updates
- Version framework (e.g., v1.0, v1.1)
- Document changes in CHANGELOG
- Test updates before rolling out
- Provide migration guides for breaking changes

---

## Support & Feedback

### Getting Help
- Review this guide and BASE_INSTRUCTIONS.md
- Check agent-specific documentation in `/agents/{agent-name}/`
- Consult team lead or architect
- Raise issues in framework repository

### Providing Feedback
- Document what worked well
- Note areas for improvement
- Suggest new agent capabilities
- Share success stories

---

**Last Updated:** March 25, 2026  
**Framework Version:** 1.0.0
