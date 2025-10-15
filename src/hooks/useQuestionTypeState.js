import { useQuestionTypeState } from "../contexts/QuestionTypeStateContext";

// 选择题状态钩子
export const useMultipleChoiceState = (mode = "practice") => {
  const {
    multipleChoicePracticeState,
    multipleChoiceExamState,
    updateMultipleChoicePracticeState,
    updateMultipleChoiceExamState,
    resetMultipleChoicePracticeState,
    resetMultipleChoiceExamState,
  } = useQuestionTypeState();

  const state =
    mode === "practice" ? multipleChoicePracticeState : multipleChoiceExamState;
  const updateState =
    mode === "practice"
      ? updateMultipleChoicePracticeState
      : updateMultipleChoiceExamState;
  const resetState =
    mode === "practice"
      ? resetMultipleChoicePracticeState
      : resetMultipleChoiceExamState;

  return {
    state,
    updateState,
    resetState,
  };
};

// 填空题状态钩子
export const useFillInBlankState = (mode = "practice") => {
  const {
    fillInBlankPracticeState,
    fillInBlankExamState,
    updateFillInBlankPracticeState,
    updateFillInBlankExamState,
    resetFillInBlankPracticeState,
    resetFillInBlankExamState,
  } = useQuestionTypeState();

  const state =
    mode === "practice" ? fillInBlankPracticeState : fillInBlankExamState;
  const updateState =
    mode === "practice"
      ? updateFillInBlankPracticeState
      : updateFillInBlankExamState;
  const resetState =
    mode === "practice"
      ? resetFillInBlankPracticeState
      : resetFillInBlankExamState;

  return {
    state,
    updateState,
    resetState,
  };
};

// 编程题状态钩子
export const useCodingState = (mode = "practice") => {
  const {
    codingPracticeState,
    codingExamState,
    updateCodingPracticeState,
    updateCodingExamState,
    resetCodingPracticeState,
    resetCodingExamState,
  } = useQuestionTypeState();

  const state = mode === "practice" ? codingPracticeState : codingExamState;
  const updateState =
    mode === "practice" ? updateCodingPracticeState : updateCodingExamState;
  const resetState =
    mode === "practice" ? resetCodingPracticeState : resetCodingExamState;

  return {
    state,
    updateState,
    resetState,
  };
};

// 论述题状态钩子
export const useEssayState = (mode = "practice") => {
  const {
    essayPracticeState,
    essayExamState,
    updateEssayPracticeState,
    updateEssayExamState,
    resetEssayPracticeState,
    resetEssayExamState,
  } = useQuestionTypeState();

  const state = mode === "practice" ? essayPracticeState : essayExamState;
  const updateState =
    mode === "practice" ? updateEssayPracticeState : updateEssayExamState;
  const resetState =
    mode === "practice" ? resetEssayPracticeState : resetEssayExamState;

  return {
    state,
    updateState,
    resetState,
  };
};

// 通用题目状态钩子
export const useQuestionState = (questionType, mode = "practice") => {
  switch (questionType) {
    case "multiple-choice":
      return useMultipleChoiceState(mode);
    case "fill-in-blank":
      return useFillInBlankState(mode);
    case "coding":
      return useCodingState(mode);
    case "essay":
      return useEssayState(mode);
    default:
      throw new Error(`Unknown question type: ${questionType}`);
  }
};
