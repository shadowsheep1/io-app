import { pipe } from "fp-ts/lib/function";
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
import ProfileMainScreen2 from "../ProfileMainScreen2";

describe("Test ProfileMainScreen2", () => {
  jest.useFakeTimers();
  it("should be not null", () => {
    const { component } = renderComponent();

    expect(component).not.toBeNull();
  });
  it("should render header H3 component with title", () => {
    const { component } = renderComponent();
    
    expect(component).not.toBeNull();
    expect(component.queryByText(I18n.t("profile.main.title"))).not.toBeNull();
  });
  it("should render ListItemComponent email with the right title and subtitle", () => {
    const { component, store } = renderComponent();

    expect(component).not.toBeNull();
    expect(component.queryByTestId("email")).not.toBeNull();
    expect(component.queryByText(I18n.t("profile.data.list.email"))).not.toBeNull();
    const email = pipe(
      profileEmailSelector(store.getState()),
      O.getOrElse(() => I18n.t("global.remoteStates.notAvailable"))
    );
    console.log(`email 💥 ->  ${email}`);
    expect(
      component.queryByText(email)
    ).not.toBeNull();
  });
  it("should render ListItemComponent name and surname with the right title and subtitle", () => {
    const { component, store } = renderComponent();

    expect(component).not.toBeNull();
    const nameSurname = profileNameSurnameSelector(store.getState());
    const listItemComponent = component.queryByTestId("name-surname");
    console.log(`name and surname 💥 -> ${nameSurname}`);
    if (nameSurname) {
      expect(listItemComponent).not.toBeNull();
      expect(listItemComponent).toHaveTextContent(
        I18n.t("profile.data.list.nameSurname")
      );
      expect(listItemComponent).toHaveTextContent(nameSurname);
    } else {
      expect(listItemComponent).toBeNull();
    }
  });
  it("should render ListItemComponent fiscal code with the right title and subtitle", () => {
    const { component, store } = renderComponent();

    expect(component).not.toBeNull();
    const fiscalCode = profileFiscalCodeSelector(store.getState());
    const listItemComponent = component.queryByTestId("fiscal-code");
    console.log(`fiscalCode 💥 -> ${fiscalCode}`);
    if (fiscalCode) {
      expect(listItemComponent).not.toBeNull();
      expect(listItemComponent).toHaveTextContent(
        I18n.t("profile.data.list.fiscalCode")
      );
      expect(listItemComponent).toHaveTextContent(fiscalCode);
    } else {
      expect(listItemComponent).toBeNull();
    }
  });
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore({
    ...globalState
  } as GlobalState);

  return {
    component: renderScreenFakeNavRedux<GlobalState>(
      () => <ProfileMainScreen2 />,
      ROUTES.PROFILE_MAIN2,
      {},
      store
    ),
    store
  };
};
