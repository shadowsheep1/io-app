import { pipe } from "fp-ts/lib/function";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import React from "react";
import configureMockStore from "redux-mock-store";
import I18n from "../../../i18n";
import ROUTES from "../../../navigation/routes";
import {
  profileFiscalCodeSelector,
  profileEmailSelector,
  profileNameSurnameSelector
} from "../../../store/reducers/profile";
import { applicationChangeState } from "../../../store/actions/application";
import { appReducer } from "../../../store/reducers";
import { GlobalState } from "../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../utils/testWrapper";
import mockedProfile from "../../../__mocks__/initializedProfile";
import ProfileMainScreen from "../screens/ProfileMainScreen";

describe("Test NewProfileMainScreen", () => {
  jest.useFakeTimers();
  it("should be not null", () => {
    const { component } = renderComponent();

    expect(component).not.toBeNull();
  });
  it("should render header H3 component with title", () => {
    const { component } = renderComponent();

    expect(component).not.toBeNull();
    expect(
      component.queryAllByText(I18n.t("profile.main.title"))
    ).not.toBeNull();
  });
  it("should render ListItemComponent email with the right title and subtitle", () => {
    const { component, store } = renderComponent();

    expect(component).not.toBeNull();
    expect(component.queryByTestId("email")).not.toBeNull();
    expect(
      component.queryByText(I18n.t("profile.data.list.email"))
    ).not.toBeNull();
    const email = pipe(
      profileEmailSelector(store.getState()),
      O.getOrElse(() => I18n.t("global.remoteStates.notAvailable"))
    );
    expect(component.queryByText(email)).not.toBeNull();
  });
  it("should render ListItemComponent name and surname with the right title and subtitle", () => {
    const { component, store } = renderComponent();
    expect(component).not.toBeNull();

    const title = I18n.t("profile.data.list.nameSurname");
    const nameSurname = profileNameSurnameSelector(store.getState());
    const listItemComponent = component.queryByTestId("name-surname");
    if (nameSurname) {
      expect(listItemComponent).not.toBeNull();
      const listItemTitleComponent = component.queryByText(title);
      const listItemSubtitleComponent = component.queryByText(nameSurname);
      expect(listItemTitleComponent).toHaveTextContent(title);
      expect(listItemSubtitleComponent).toHaveTextContent(nameSurname);
    } else {
      expect(listItemComponent).toBeNull();
    }
  });
  it("should render ListItemComponent fiscal code with the right title and subtitle", () => {
    const { component, store } = renderComponent();
    expect(component).not.toBeNull();

    const title = I18n.t("profile.data.list.fiscalCode");
    const fiscalCode = profileFiscalCodeSelector(store.getState());
    const listItemComponent = component.queryByTestId("name-surname");
    if (fiscalCode) {
      expect(listItemComponent).not.toBeNull();
      const listItemTitleComponent = component.queryByText(title);
      const listItemSubtitleComponent = component.queryByText(fiscalCode);
      expect(listItemTitleComponent).toHaveTextContent(title);
      expect(listItemSubtitleComponent).toHaveTextContent(fiscalCode);
    } else {
      expect(listItemComponent).toBeNull();
    }
  });
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore({
    ...globalState,
    profile: pot.some(mockedProfile)
  } as GlobalState);

  return {
    component: renderScreenFakeNavRedux<GlobalState>(
      () => <ProfileMainScreen />,
      ROUTES.PROFILE_MAIN2,
      {},
      store
    ),
    store
  };
};
