using FluentValidation;
using ResumeOptim.API.DTOs;

namespace ResumeOptim.API.Validators;

public class AnalysisRequestValidator : AbstractValidator<AnalysisRequestDto>
{
    public AnalysisRequestValidator()
    {
        RuleFor(x => x.ResumeFile)
            .NotNull()
            .WithMessage("Resume file is required");

        RuleFor(x => x.JobDescription)
            .NotEmpty()
            .WithMessage("Job description is required")
            .MinimumLength(50)
            .WithMessage("Job description must be at least 50 characters")
            .MaximumLength(5000)
            .WithMessage("Job description cannot exceed 5000 characters");
    }
}